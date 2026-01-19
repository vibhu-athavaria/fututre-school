-- =========================================================
-- Curriculum & Knowledge Graph Schema
-- Target DB: PostgreSQL
-- =========================================================

BEGIN;

-- =========================================================
-- 1. Curriculum Provider
-- =========================================================
CREATE TABLE curriculum (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,          -- Cambridge, CBSE, IB
  code TEXT UNIQUE,                   -- CAM, CBSE, IB
  description TEXT
);

-- =========================================================
-- 2. Grade (Curriculum-agnostic)
-- =========================================================
CREATE TABLE grade (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,                 -- Grade 5
  level INT NOT NULL,                 -- 5
  UNIQUE (level)
);

-- =========================================================
-- 3. Subject
-- =========================================================
CREATE TABLE subject (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE            -- Math, Science
);

-- =========================================================
-- 4. Topic (Reusable Knowledge Unit)
-- =========================================================
CREATE TABLE topic (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  canonical_code TEXT,
  difficulty_level INT CHECK (difficulty_level BETWEEN 1 AND 5),
  learning_objectives TEXT[],
  UNIQUE (name)
);

-- =========================================================
-- 5. Topic Prerequisites (Directed Graph)
-- =========================================================
CREATE TABLE topic_prerequisite (
  topic_id INT NOT NULL,
  prerequisite_topic_id INT NOT NULL,

  PRIMARY KEY (topic_id, prerequisite_topic_id),

  CONSTRAINT fk_topic
    FOREIGN KEY (topic_id)
    REFERENCES topic(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_prerequisite_topic
    FOREIGN KEY (prerequisite_topic_id)
    REFERENCES topic(id)
    ON DELETE CASCADE,

  CONSTRAINT chk_no_self_prereq
    CHECK (topic_id <> prerequisite_topic_id)
);

-- =========================================================
-- 6. Curriculum Topic Mapping
-- =========================================================
CREATE TABLE curriculum_topic (
  id SERIAL PRIMARY KEY,

  curriculum_id INT NOT NULL,
  grade_id INT NOT NULL,
  subject_id INT NOT NULL,
  topic_id INT NOT NULL,

  sequence_order INT,
  difficulty_level INT CHECK (difficulty_level BETWEEN 1 AND 5),
  learning_objectives TEXT[],

  CONSTRAINT fk_curriculum
    FOREIGN KEY (curriculum_id)
    REFERENCES curriculum(id),

  CONSTRAINT fk_grade
    FOREIGN KEY (grade_id)
    REFERENCES grade(id),

  CONSTRAINT fk_subject
    FOREIGN KEY (subject_id)
    REFERENCES subject(id),

  CONSTRAINT fk_topic_mapping
    FOREIGN KEY (topic_id)
    REFERENCES topic(id),

  UNIQUE (curriculum_id, grade_id, subject_id, topic_id)
);

-- =========================================================
-- 7. Subtopic (Curriculum-scoped)
-- =========================================================
CREATE TABLE subtopic (
  id SERIAL PRIMARY KEY,

  curriculum_topic_id INT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sequence_order INT,
  difficulty_level INT CHECK (difficulty_level BETWEEN 1 AND 5),
  learning_objectives TEXT[],

  CONSTRAINT fk_curriculum_topic
    FOREIGN KEY (curriculum_topic_id)
    REFERENCES curriculum_topic(id)
    ON DELETE CASCADE
);

-- =========================================================
-- 8. Indexes (Performance)
-- =========================================================
CREATE INDEX idx_curriculum_topic_lookup
  ON curriculum_topic (curriculum_id, grade_id, subject_id);

CREATE INDEX idx_topic_prerequisite_topic
  ON topic_prerequisite (topic_id);

CREATE INDEX idx_topic_prerequisite_prereq
  ON topic_prerequisite (prerequisite_topic_id);

COMMIT;
