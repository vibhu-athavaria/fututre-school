from sqlalchemy.orm import Session
from app.models.user import StudentProfile, User
from app.schemas.user import StudentProfileUpdate
from typing import Optional
from app.core.security import verify_password, get_password_hash

def get_student(db: Session, student_id: int) -> Optional[StudentProfile]:
    return db.query(StudentProfile).filter(StudentProfile.id == student_id).first()

def get_student_by_username(db: Session, username: str) -> Optional[StudentProfile]:
    query = db.query(StudentProfile).filter(StudentProfile.username == username)
    print(str(query.statement))   # prints the SQL (with placeholders like :param_1)
    return query.first()

def update_student(db: Session, student_id: int, updates: StudentProfileUpdate) -> StudentProfile | None:
    # Fetch student profile
    db_student_profile = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not db_student_profile:
        return None

    # Fetch linked user
    db_user = db.query(User).filter(User.id == db_student_profile.user_id).first()
    if not db_user:
        return None

    # Update User fields
    if updates.username is not None:
        db_user.username = updates.username
    if updates.email is not None:
        db_user.email = updates.email
    if updates.password is not None:
        db_user.hashed_password = get_password_hash(updates.password)

    # Update StudentProfile fields
    if updates.age is not None:
        db_student_profile.age = updates.age
    if updates.grade_level is not None:
        db_student_profile.grade_level = updates.grade_level
    if updates.checkpoints is not None:
        db_student_profile.math_checkpoint = updates.checkpoints.get("math")
        db_student_profile.science_checkpoint = updates.checkpoints.get("science")
        db_student_profile.english_checkpoint = updates.checkpoints.get("english")

    db.commit()
    db.refresh(db_student_profile)

    return db_student_profile

def delete_student(db: Session, student_id: int) -> bool:
    db_student = get_student(db, student_id)
    if not db_student:
        return False

    db.delete(db_student)
    db.commit()
    return True

def get_student_by_parent_and_id(db: Session, parent_id: int, student_id: int) -> Optional[StudentProfile]:
    return db.query(StudentProfile).filter(
        StudentProfile.parent_id == parent_id,
        StudentProfile.id == student_id
    ).first()

def authenticate_student(db: Session, username: str, password: str) -> Optional[StudentProfile]:
    student = get_student_by_username(db, username)
    if not student:
        return None
    if not verify_password(password, student.hashed_password):
        return None
    return student