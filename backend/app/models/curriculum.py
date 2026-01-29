from sqlalchemy import Column, Integer, Text, ForeignKey, CheckConstraint, UniqueConstraint
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.crud.mixin import SerializerMixin


class Curriculum(Base, SerializerMixin):
    __tablename__ = "curriculum"

    id = Column(Integer, primary_key=True)
    name = Column(Text, nullable=False, unique=True)
    code = Column(Text, nullable=True, unique=True)
    description = Column(Text, nullable=True)

    # Relationships
    curriculum_topics = relationship("CurriculumTopic", back_populates="curriculum")


class Topic(Base, SerializerMixin):
    __tablename__ = "topic"

    id = Column(Integer, primary_key=True)
    name = Column(Text, nullable=False, unique=True)
    description = Column(Text, nullable=True)
    canonical_code = Column(Text, nullable=True)
    difficulty_level = Column(Integer, nullable=True)
    learning_objectives = Column(ARRAY(Text), nullable=True)

    # Constraints
    __table_args__ = (
        CheckConstraint('difficulty_level BETWEEN 1 AND 5', name='chk_topic_difficulty_level'),
    )

    # Relationships
    curriculum_topics = relationship("CurriculumTopic", back_populates="topic")
    prerequisite_topics = relationship("TopicPrerequisite", foreign_keys="[TopicPrerequisite.topic_id]", back_populates="topic")
    prerequisite_for_topics = relationship("TopicPrerequisite", foreign_keys="[TopicPrerequisite.prerequisite_topic_id]", back_populates="prerequisite_topic")


class Subtopic(Base, SerializerMixin):
    __tablename__ = "subtopic"

    id = Column(Integer, primary_key=True)
    curriculum_topic_id = Column(Integer, ForeignKey("curriculum_topic.id", ondelete="CASCADE"), nullable=False)
    name = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    sequence_order = Column(Integer, nullable=True)
    difficulty_level = Column(Integer, nullable=True)
    learning_objectives = Column(ARRAY(Text), nullable=True)

    # Constraints
    __table_args__ = (
        CheckConstraint('difficulty_level BETWEEN 1 AND 5', name='chk_subtopic_difficulty_level'),
    )

    # Relationships
    curriculum_topic = relationship("CurriculumTopic", back_populates="subtopics")


class TopicPrerequisite(Base, SerializerMixin):
    __tablename__ = "topic_prerequisite"

    topic_id = Column(Integer, ForeignKey("topic.id", ondelete="CASCADE"), primary_key=True)
    prerequisite_topic_id = Column(Integer, ForeignKey("topic.id", ondelete="CASCADE"), primary_key=True)

    # Constraints
    __table_args__ = (
        CheckConstraint('topic_id <> prerequisite_topic_id', name='chk_no_self_prereq'),
    )

    # Relationships
    topic = relationship("Topic", foreign_keys=[topic_id], back_populates="prerequisite_topics")
    prerequisite_topic = relationship("Topic", foreign_keys=[prerequisite_topic_id], back_populates="prerequisite_for_topics")


class CurriculumTopic(Base, SerializerMixin):
    __tablename__ = "curriculum_topic"

    id = Column(Integer, primary_key=True)
    curriculum_id = Column(Integer, ForeignKey("curriculum.id"), nullable=False)
    grade_id = Column(Integer, ForeignKey("grade.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subject.id"), nullable=False)
    topic_id = Column(Integer, ForeignKey("topic.id"), nullable=False)
    sequence_order = Column(Integer, nullable=True)
    difficulty_level = Column(Integer, nullable=True)
    learning_objectives = Column(ARRAY(Text), nullable=True)

    # Constraints
    __table_args__ = (
        UniqueConstraint('curriculum_id', 'grade_id', 'subject_id', 'topic_id'),
        CheckConstraint('difficulty_level BETWEEN 1 AND 5', name='chk_curriculum_topic_difficulty_level'),
    )

    # Relationships
    curriculum = relationship("Curriculum", back_populates="curriculum_topics")
    grade = relationship("Grade", back_populates="curriculum_topics")
    subject = relationship("Subject", back_populates="curriculum_topics")
    topic = relationship("Topic", back_populates="curriculum_topics")
    subtopics = relationship("Subtopic", back_populates="curriculum_topic", cascade="all, delete-orphan")


class Grade(Base, SerializerMixin):
    __tablename__ = "grade"

    id = Column(Integer, primary_key=True)
    name = Column(Text, nullable=False)
    level = Column(Integer, nullable=False, unique=True)

    # Relationships
    curriculum_topics = relationship("CurriculumTopic", back_populates="grade")
