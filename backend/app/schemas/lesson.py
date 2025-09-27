# app/schemas/study_plan.py

from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


# -----------------------------
# Lesson Schemas
# -----------------------------
class LessonBase(BaseModel):
    title: str
    description: Optional[str] = None
    content: Optional[str] = None
    difficulty_level: Optional[str] = None
    subject: Optional[str] = None
    points_value: int = 10


class LessonCreate(LessonBase):
    pass


class LessonUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    difficulty_level: Optional[str] = None
    subject: Optional[str] = None
    points_value: Optional[int] = None
    is_active: Optional[bool] = None


class Lesson(LessonBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# -----------------------------
# StudyPlan Lesson Schemas
# -----------------------------
class StudyPlanLessonBase(BaseModel):
    title: str
    knowledge_area_id: Optional[int] = None
    suggested_duration_mins: Optional[int] = None
    week: Optional[int] = None
    details: Optional[str] = None


class StudyPlanLessonCreate(StudyPlanLessonBase):
    order_index: Optional[int] = None


class StudyPlanLessonUpdate(BaseModel):
    is_completed: Optional[bool] = None


class StudyPlanLessonOut(StudyPlanLessonBase):
    id: int
    study_plan_id: int
    lesson_id: Optional[int] = None
    order_index: Optional[int] = None
    is_completed: bool = False
    completed_at: Optional[datetime] = None
    lesson: Optional[Lesson] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# -----------------------------
# StudyPlan Schemas
# -----------------------------
class StudyPlan(BaseModel):
    title: str = "Personalized Study Plan"
    summary: Optional[str] = None
    description: Optional[str] = None
    metadata: Optional[Any] = None


class StudyPlanCreate(StudyPlan):
    assessment_id: Optional[int] = None
    student_id: int
    lesson_ids: Optional[List[int]] = []  # quick link lessons
    lessons: List[StudyPlanLessonCreate] = []  # full lesson objects


class StudyPlanUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    description: Optional[str] = None
    metadata: Optional[Any] = None
    is_active: Optional[bool] = None


class StudyPlanOut(StudyPlan):
    id: int
    assessment_id: Optional[int] = None
    student_id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    lessons: List[StudyPlanLessonOut] = []

    class Config:
        from_attributes = True
