import json
import psycopg2
from psycopg2 import extras
import os

# --- Configuration ---
# IMPORTANT: Replace these with your actual PostgreSQL database credentials
DB_NAME = "your_database_name"
DB_USER = "your_db_user"
DB_PASS = "your_db_password"
DB_HOST = "localhost" # or your database server IP/hostname
DB_PORT = "5432"

# Fixed lists for structural data based on the provided JSON files (Grades 5-12)
GRADES_LIST = [str(g) for g in range(5, 13)]  # '5', '6', '7', '8', '9', '10', '11', '12'
SUBJECTS_LIST = ['mathematics', 'science', 'english', 'humanities']

# List of JSON files to process
JSON_FILES = [
    'cambridge-grade5.json',
    'cambridge-grade6.json',
    'cambridge-grade7.json',
    'cambridge-grade8.json',
    'cambridge-grade9.json',
    'cambridge-grade10.json',
    'cambridge-grade11.json',
    'cambridge-grade12.json'
]
# ---------------------

def connect_db():
    """Establishes and returns a connection to the PostgreSQL database."""
    try:
        conn = psycopg2.connect(
            dbname='fschool',
            user='postgres',
            password='rafiki1234!',
            host='localhost',
            port='5432'
        )
        print("Database connection successful.")
        return conn
    except psycopg2.Error as e:
        print(f"Error connecting to the database: {e}")
        return None

def preload_grades_and_subjects(conn):
    """
    Inserts all fixed grades and all fixed subjects for those grades into the DB.
    Returns a dictionary mapping (grade_number, subject_name) to subject_id.
    """
    cur = conn.cursor()
    subject_map = {}

    print("\n--- Preloading Grades and Subjects ---")

    try:
        # 1. Insert all Grades
        grade_maps = {}
        for grade_number in GRADES_LIST:
            # Insert Grade (ON CONFLICT prevents duplicates)
            cur.execute(
                "INSERT INTO grades (grade_number) VALUES (%s) ON CONFLICT (grade_number) DO UPDATE SET grade_number = EXCLUDED.grade_number RETURNING id",
                (grade_number,)
            )
            grade_id = cur.fetchone()[0]
            grade_maps['grade ' + grade_number] = grade_id
            print(f"  Preloaded Grade {grade_number} (ID: {grade_id})")

        # 2. Insert all Subjects
        for subject_name in SUBJECTS_LIST:
            # Insert Subject (ON CONFLICT prevents duplicates)
            cur.execute(
                "INSERT INTO subjects (name) VALUES (%s)",
                (subject_name,)
            )
            subject_id = cur.fetchone()[0]
            print(f"  Preloaded Subject '{subject_name}' (ID: {subject_id})")
            subject_map[subject_name] = subject_id

        conn.commit()
        print("--- Preloading Complete ---")
        return [grade_maps, subject_map]

    except psycopg2.Error as e:
        print(f"Database error during preloading: {e}")
        conn.rollback()
        return {}
    finally:
        cur.close()


def process_and_load_data(conn, file_path, grade_maps, subject_map):
    """
    Reads a single JSON file and loads Topics and Subtopics using the pre-loaded subject IDs.
    """
    cur = conn.cursor()
    print(f"\n--- Processing content from file: {file_path} ---")

    try:
        # 1. Load JSON Data
        with open(file_path, 'r') as f:
            data = json.load(f)

        # 2. Iterate through Grades (Top Level)
        for grade_key, subjects_data in data.items():
            # Extract the clean grade number (e.g., "grade 6" -> "6")
            grade_id = grade_maps.get(grade_key)

            print(f"  Parsing content for Grade {grade_key}")

            # 3. Iterate through Subjects
            for subject_name, topics_data in subjects_data.items():

                # Retrieve the subject_id from the pre-loaded map
                subject_id = subject_map.get(subject_name)

                if not subject_id:
                    print(f"    Skipping: Subject '{subject_name}' not found in preload map for Grade {grade_key}.")
                    continue

                print(f"    Loading Subject '{subject_name}' (ID: {subject_id})")

                # 4. Iterate through Topics
                topic_order = 1
                for topic_title, subtopics_list in topics_data.items():

                    # --- 4.1 Insert into topics table ---
                    # Note: We prioritize the title update if the order matches.
                    try:
                        cur.execute(
                            """
                            INSERT INTO topics (grade_id, subject_id, title)
                            VALUES (%s, %s, %s)
                            ON CONFLICT (grade_id, subject_id, title) DO UPDATE
                            SET title = EXCLUDED.title
                            RETURNING id
                            """,
                            (grade_id, subject_id, topic_title)
                        )
                        topic_id = cur.fetchone()[0]
                        print(f"      Inserted Topic '{topic_title}' (ID: {topic_id})")
                    except psycopg2.Error as e:
                        print(f"      Error inserting Topic '{topic_title}': {e}")
                        conn.rollback()
                        continue

                    # 5. Iterate through Subtopics (Learning Outcomes)
                    for subtopic_description in subtopics_list:
                        # Use the entire description as the title, truncated to VARCHAR(255)
                        subtopic_title = subtopic_description[:255]
                        print(f"        Inserting Subtopic '{subtopic_title}' under Topic ID {topic_id}")
                        # --- 5.1 Insert into subtopics table ---
                        try:
                            cur.execute(
                                """
                                INSERT INTO subtopics (topic_id, title, description)
                                VALUES (%s, %s, %s)
                                ON CONFLICT DO NOTHING
                                """,
                                (topic_id, subtopic_title, subtopic_description)
                            )
                            print(f"        Inserted Subtopic '{subtopic_title}'")
                        except psycopg2.Error as e:
                            print(f"        Error inserting Subtopic '{subtopic_title}': {e}")
                            conn.rollback()
                            continue
                    # Increment order for the next topic in the subject
                    topic_order += 1

        # Commit all changes for the file
        conn.commit()
        print(f"--- Successfully loaded content from {file_path} ---")

    except FileNotFoundError:
        print(f"Error: JSON file not found at {file_path}")
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON from {file_path}: {e}")
    except psycopg2.Error as e:
        print(f"Database error during content processing {file_path}: {e}")
        conn.rollback() # Rollback changes if an error occurs
    finally:
        cur.close()


def main():
    """Main function to run the data loading process."""
    conn = connect_db()

    if conn:
        # Step 1: Preload fixed structural data (Grades and Subjects)
        # [grade_maps, subject_map] = preload_grades_and_subjects(conn)
        grade_maps = {'grade 5': 1, 'grade 6': 2, 'grade 7': 3, 'grade 8': 4, 'grade 9': 5, 'grade 10': 6, 'grade 11': 7, 'grade 12': 8}
        subject_map = {'mathematics': 1, 'science': 2, 'english': 3, 'humanities': 4}

        # Step 2: Process dynamic content (Topics and Subtopics) from JSON files
        file_dir = os.path.dirname(os.path.abspath(__file__))
        parent_dir = os.path.dirname(file_dir)

        data_dir = os.path.join(parent_dir, 'data')

        if grade_maps and subject_map:
            for file_name in JSON_FILES:
                file_path = os.path.join(data_dir, file_name)
                print(f"\nProcessing file: {file_path}")
                process_and_load_data(conn, file_path, grade_maps, subject_map)

        conn.close()
        print("\nAll files processed. Database connection closed.")
    else:
        print("\nExiting without processing data due to database connection failure.")

if __name__ == "__main__":
    main()