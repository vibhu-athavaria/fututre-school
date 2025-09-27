# app/services/llm_service.py
import os
import json
from typing import Dict, Any, Optional
import random
import logging

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self.provider = os.getenv("LLM_PROVIDER", "mock")  # "mock", "openai", "claude", "gemini", "ollama"
        # Lazy-init provider clients as needed (not shown). E.g. openai.api_key = os.getenv("OPENAI_API_KEY")

    # ---------------------
    # Question generation
    # ---------------------
    def generate_question(self, subject: str, grade_level: str, topic: Optional[str], difficulty: float) -> Dict[str, Any]:
        """
        Returns validated dict keys:
        - question_text, question_type, options (optional), correct_answer, topic, subtopic, difficulty_level
        """
        if self.provider == "mock":
            # Quick mock question
            difficulty_level = "easy" if difficulty < 0.4 else ("medium" if difficulty < 0.75 else "hard")
            choices = ["A", "B", "C", "D"]
            correct = random.choice(choices)
            return {
                "question_text": f"Mock: {subject} ({topic or 'General'}) - difficulty {difficulty_level}",
                "question_type": "multiple_choice",
                "options": choices,
                "correct_answer": correct,
                "topic": topic or "General",
                "subtopic": None,
                "difficulty_level": difficulty_level,
            }

        # Example: OpenAI (pseudocode)
        if self.provider == "openai":
            from openai import OpenAI
            client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            system = (
                "You are an educational question generator. Output only JSON matching the schema: "
                '{"question_text":"", "question_type":"", "options":[], "correct_answer":"", "topic":"", "subtopic":"", "difficulty_level":""}'
            )
            prompt = (
                f"Generate one {grade_level} {subject} question. Target topic: {topic or 'general'}. "
                f"Target difficulty (0-1): {difficulty:.2f}. Return JSON only."
            )
            resp = client.chat.completions.create(model="gpt-4o-mini", messages=[{"role":"system","content":system},{"role":"user","content":prompt}], max_tokens=400)
            text = resp.choices[0].message["content"]
            try:
                data = json.loads(text)
                # TODO: validate fields; cast difficulty label if numeric
                return data
            except Exception as e:
                logger.exception("Failed to parse LLM output")
                raise

        # TODO: Add other providers
        raise NotImplementedError(f"LLM provider {self.provider} not implemented")

    # ---------------------
    # Answer scoring
    # ---------------------
    def score_answer(self, question: Dict[str, Any], student_answer: str) -> Dict[str, Any]:
        """
        Return: { is_correct: bool, score: float (0-1), feedback: str }
        Behavior:
        - If MCQ and exact match: deterministic
        - If short answer: call LLM grader (or safe heuristics)
        """
        if self.provider == "mock":
            correct = str(question.get("correct_answer", "")).strip().lower()
            ans = (student_answer or "").strip().lower()
            is_correct = False
            if question.get("question_type") == "multiple_choice":
                is_correct = ans == correct.lower()
            else:
                # naive contains check (mock)
                is_correct = correct and (correct in ans)
            return {
                "is_correct": bool(is_correct),
                "score": 1.0 if is_correct else 0.0,
                "feedback": "Correct!" if is_correct else "Not quite — try reviewing the method."
            }

        if self.provider == "openai":
            from openai import OpenAI
            client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            # Use a grading prompt that returns JSON: {"is_correct": true/false, "score":0.0-1.0, "feedback": "text"}
            system = "You are an objective grader. Output only JSON: {is_correct: bool, score: float, feedback: str}"
            prompt = (
                "Grade the student's answer. Question: "
                f"{question.get('question_text')}\n"
                f"Correct answer: {question.get('correct_answer')}\n"
                f"Student answer: {student_answer}\n"
                "If partially correct, give fractional score 0-1 and short feedback."
            )
            resp = client.chat.completions.create(model="gpt-4o-mini", messages=[{"role":"system","content":system},{"role":"user","content":prompt}], max_tokens=256)
            text = resp.choices[0].message["content"]
            try:
                parsed = json.loads(text)
                return parsed
            except Exception as e:
                logger.exception("LLM grading parse error")
                raise

        raise NotImplementedError(f"LLM provider {self.provider} not implemented")

    # ---------------------
    # Study plan generation
    # ---------------------
    def generate_study_plan(self, mastery_map: Dict[str, float], subject: str, grade_level: str, top_n: int = 5) -> Dict[str, Any]:
        if self.provider == "mock":
            items = sorted(mastery_map.items(), key=lambda x: x[1])[:top_n]
            lessons = []
            week = 1
            for topic, score in items:
                lessons.append({
                    "title": f"Practice {topic}",
                    "topic": topic,
                    "suggested_duration_mins": 20,
                    "week": week,
                    "details": f"Work through fundamentals of {topic}. 3 practice problems, 1 short quiz."
                })
                week += 1
            return {"summary": f"Focus on {', '.join([t for t,_ in items])}", "lessons": lessons}
        # implement for real providers similarly to generate_question
        raise NotImplementedError
