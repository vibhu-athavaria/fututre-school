import psycopg2
import pandas as pd
import os
import sys

# Add backend directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.core.config import settings

CSV_PATH = "backend/data/cambridge_curriculum_from_md.csv"
CURRICULUM_NAME = "Cambridge"
CURRICULUM_CODE = "CAM"

# ------------------------------
# DB Connection
# ------------------------------
# Parse DATABASE_URL to get connection parameters
from urllib.parse import urlparse
db_url = urlparse(settings.DATABASE_URL)
DB_CONFIG = {
    'host': db_url.hostname,
    'port': db_url.port,
    'user': db_url.username,
    'password': db_url.password,
    'database': db_url.path.lstrip('/')
}

conn = psycopg2.connect(**DB_CONFIG)
conn.autocommit = False
cur = conn.cursor()

# ------------------------------
# Helper functions
# ------------------------------
def get_or_create(table, where_clause, values, returning="id"):
    query = f"""
        INSERT INTO {table} ({', '.join(values.keys())})
        VALUES ({', '.join(['%s'] * len(values))})
        ON CONFLICT {where_clause} DO NOTHING
        RETURNING {returning};
    """
    cur.execute(query, list(values.values()))
    row = cur.fetchone()
    if row:
        return row[0]

    # fetch existing
    where_keys = where_clause.replace("(", "").replace(")", "").split(",")
    where = " AND ".join([f"{k.strip()}=%s" for k in where_keys])
    cur.execute(
        f"SELECT {returning} FROM {table} WHERE {where}",
        [values[k.strip()] for k in where_keys]
    )
    return cur.fetchone()[0]

# ------------------------------
# Load CSV
# ------------------------------
df = pd.read_csv(CSV_PATH)
df = df.fillna("")

# ------------------------------
# Curriculum
# ------------------------------
curriculum_id = get_or_create(
    "curriculum",
    "(name)",
    {
        "name": CURRICULUM_NAME,
        "code": CURRICULUM_CODE,
        "description": "Imported from CSV"
    }
)

# ------------------------------
# Cache (performance)
# ------------------------------
grade_cache = {}
subject_cache = {}
topic_cache = {}
curriculum_topic_cache = {}

# ------------------------------
# Main import
# ------------------------------
for _, row in df.iterrows():
    grade_level = int(row["grade"])
    subject_name = row["subject"].strip()
    topic_name = row["topic"].strip()
    subtopic_name = row["subtopic"].strip()
    prereq_raw = row["prerequisites"].strip()

    # ---- Grade
    if grade_level not in grade_cache:
        grade_cache[grade_level] = get_or_create(
            "grade",
            "(level)",
            {
                "name": f"Grade {grade_level}",
                "level": grade_level
            }
        )
    grade_id = grade_cache[grade_level]

    # ---- Subject
    if subject_name not in subject_cache:
        subject_cache[subject_name] = get_or_create(
            "subject",
            "(name)",
            {"name": subject_name}
        )
    subject_id = subject_cache[subject_name]

    # ---- Topic
    if topic_name not in topic_cache:
        topic_cache[topic_name] = get_or_create(
            "topic",
            "(name)",
            {
                "name": topic_name,
                "description": None,
                "canonical_code": None,
                "difficulty_level": 3,  # Default medium difficulty
                "learning_objectives": []
            }
        )
    topic_id = topic_cache[topic_name]

    # ---- Curriculum Topic
    ct_key = (curriculum_id, grade_id, subject_id, topic_id)
    if ct_key not in curriculum_topic_cache:
        cur.execute("""
            INSERT INTO curriculum_topic
            (curriculum_id, grade_id, subject_id, topic_id, difficulty_level, learning_objectives)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT DO NOTHING
            RETURNING id
        """, (*ct_key, 3, []))  # Default values: medium difficulty, no objectives
        row_id = cur.fetchone()

        if row_id:
            curriculum_topic_cache[ct_key] = row_id[0]
        else:
            cur.execute("""
                SELECT id FROM curriculum_topic
                WHERE curriculum_id=%s AND grade_id=%s
                AND subject_id=%s AND topic_id=%s
            """, ct_key)
            curriculum_topic_cache[ct_key] = cur.fetchone()[0]

    curriculum_topic_id = curriculum_topic_cache[ct_key]

    # ---- Subtopic
    if subtopic_name:
        cur.execute("""
            INSERT INTO subtopic (curriculum_topic_id, name, difficulty_level, learning_objectives)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT DO NOTHING
        """, (curriculum_topic_id, subtopic_name, 3, []))  # Default values: medium difficulty, no objectives

    # ---- Prerequisites (topic-level)
    if prereq_raw:
        prereqs = [p.strip() for p in prereq_raw.split(",") if p.strip()]
        for prereq_name in prereqs:
            if prereq_name not in topic_cache:
                topic_cache[prereq_name] = get_or_create(
                    "topic",
                    "(name)",
                    {
                        "name": prereq_name,
                        "description": None,
                        "canonical_code": None
                    }
                )

            prereq_id = topic_cache[prereq_name]
            cur.execute("""
                INSERT INTO topic_prerequisite (topic_id, prerequisite_topic_id)
                VALUES (%s, %s)
                ON CONFLICT DO NOTHING
            """, (topic_id, prereq_id))

# ------------------------------
# Commit
# ------------------------------
conn.commit()
cur.close()
conn.close()

print("✅ Curriculum import completed successfully.")
