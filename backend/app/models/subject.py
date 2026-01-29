from sqlalchemy import Column, Integer, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.crud.mixin import SerializerMixin

class Subject(Base, SerializerMixin):
    __tablename__ = "subject"

    id = Column(Integer, primary_key=True)
    name = Column(Text, nullable=False, unique=True)

    # Relationships
    micro_courses = relationship("MicroCourse", back_populates="subject")
    curriculum_topics = relationship("CurriculumTopic", back_populates="subject")
    # subscriptions = relationship("Subscription", back_populates="subject")