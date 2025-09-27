# app/api/v1/assessments.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app import models
from app.schemas import assessment as schemas
from app.services.assessment_service import create_question, pick_next_topic_and_difficulty, update_mastery, difficulty_float_from_label, llm
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=schemas.AssessmentOut)
def start_assessment(payload: schemas.AssessmentCreate, db: Session = Depends(get_db)):
    assessment = models.Assessment(
        student_id = payload.student_id,
        subject = payload.subject,
        grade_level = payload.grade_level,
        assessment_type = payload.assessment_type,
        status = "in_progress"
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    # pick initial topic/difficulty
    sel = pick_next_topic_and_difficulty(db, payload.student_id, payload.subject)
    q = create_question(db, assessment, sel.get("topic"), sel.get("subtopic"), sel.get("difficulty"), order=1)
    assessment.total_questions = 1
    db.commit()
    db.refresh(assessment)
    return assessment

@router.get("/{assessment_id}", response_model=schemas.AssessmentOut)
def get_assessment(assessment_id: int, db: Session = Depends(get_db)):
    assessment = db.query(models.Assessment).filter(models.Assessment.id==assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment

@router.post("/{assessment_id}/questions/{question_id}/answer", response_model=schemas.AnswerOut)
def submit_answer(assessment_id: int, question_id: int, payload: schemas.AnswerSubmit, db: Session = Depends(get_db)):
    q = db.query(models.AssessmentQuestion).filter(models.AssessmentQuestion.id==question_id, models.AssessmentQuestion.assessment_id==assessment_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")

    assessment = db.query(models.Assessment).filter(models.Assessment.id==assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    # Score using LLM service
    question_payload = {
        "question_text": q.question_text,
        "question_type": q.question_type,
        "options": q.options,
        "correct_answer": q.correct_answer,
    }
    score_result = llm.score_answer(question_payload, payload.answer_text)
    q.student_answer = payload.answer_text
    q.is_correct = bool(score_result.get("is_correct"))
    q.score = float(score_result.get("score", 0.0))
    q.answered_at = datetime.utcnow()
    q.ai_feedback = score_result.get("feedback")
    q.time_taken = payload.time_taken
    db.add(q)

    # update StudentKnowledgeProfile
    # find or create SKP
    ka = q.knowledge_area
    skp = db.query(models.StudentKnowledgeProfile).filter_by(student_id=assessment.student_id, knowledge_area_id=ka.id).first()
    if not skp:
        skp = models.StudentKnowledgeProfile(student_id=assessment.student_id, knowledge_area_id=ka.id, mastery_level=0.5, assessment_count=0)
    current_skill = skp.mastery_level or 0.5
    diff_val = difficulty_float_from_label(q.difficulty_level)
    new_skill = update_mastery(current_skill, diff_val, q.is_correct)
    skp.mastery_level = new_skill
    skp.assessment_count = (skp.assessment_count or 0) + 1
    skp.last_assessed = datetime.utcnow()
    db.add(skp)

    # update assessment counters and maybe finish
    assessment.questions_answered = (assessment.questions_answered or 0) + 1
    assessment.total_questions = (assessment.total_questions or 0)  # set on start/created
    # generate next question unless finished
    MAX_Q = 12
    next_q_payload = None
    if assessment.questions_answered >= MAX_Q:
        assessment.status = "completed"
        assessment.completed_at = datetime.utcnow()
        # compute overall score
        answers_scores = [item.score or 0.0 for item in assessment.questions]
        assessment.overall_score = (sum(answers_scores)/len(answers_scores))*100 if answers_scores else None
        db.add(assessment)
        db.commit()
        return {"question_id": q.id, "is_correct": q.is_correct, "score": q.score, "feedback": q.ai_feedback, "next_question": None}
    # else create next
    sel = pick_next_topic_and_difficulty(db, assessment.student_id, assessment.subject)
    order = (q.question_number or 1) + 1
    next_q = create_question(db, assessment, sel.get("topic"), sel.get("subtopic"), sel.get("difficulty"), order=order)
    assessment.total_questions = (assessment.total_questions or 0) + 1
    db.add(assessment)
    db.commit()
    # return answer + next question
    return {
        "question_id": q.id,
        "is_correct": q.is_correct,
        "score": q.score,
        "feedback": q.ai_feedback,
        "next_question": next_q
    }

@router.post("/{assessment_id}/complete", response_model=schemas.AssessmentOut)
def complete_assessment(assessment_id: int, db: Session = Depends(get_db)):
    assessment = db.query(models.Assessment).filter(models.Assessment.id==assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    # Build mastery_map
    skps = db.query(models.StudentKnowledgeProfile).join(models.KnowledgeArea).filter(
        models.StudentKnowledgeProfile.student_id==assessment.student_id,
        models.KnowledgeArea.subject==assessment.subject
    ).all()
    mastery_map = {skp.knowledge_area.topic: skp.mastery_level for skp in skps}
    plan_payload = llm.generate_study_plan(mastery_map, assessment.subject, assessment.grade_level)
    assessment.recommendations = plan_payload
    assessment.status = "completed"
    assessment.completed_at = datetime.utcnow()
    db.add(assessment); db.commit(); db.refresh(assessment)
    return assessment
