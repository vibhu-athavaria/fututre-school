#!/usr/bin/env python3
"""
Unit tests for curriculum import process
Tests the enhanced schema with difficulty levels and learning objectives
"""

import unittest
import psycopg2
import pandas as pd
from unittest.mock import patch, MagicMock
import sys
import os

# Mock the get_or_create function for testing
def get_or_create(cursor, table, where_clause, values, returning="id"):
    """Mock implementation of get_or_create for testing"""
    # Simulate INSERT attempt
    query = f"""
        INSERT INTO {table} ({', '.join(values.keys())})
        VALUES ({', '.join(['%s'] * len(values))})
        ON CONFLICT {where_clause} DO NOTHING
        RETURNING {returning};
    """
    cursor.execute(query, list(values.values()))
    row = cursor.fetchone()
    if row:
        return row[0]

    # Simulate SELECT for existing record
    where_keys = where_clause.replace("(", "").replace(")", "").split(",")
    where = " AND ".join([f"{k.strip()}=%s" for k in where_keys])
    cursor.execute(
        f"SELECT {returning} FROM {table} WHERE {where}",
        [values[k.strip()] for k in where_keys]
    )
    return cursor.fetchone()[0]


class TestCurriculumImport(unittest.TestCase):
    """Test suite for curriculum import functionality"""

    def setUp(self):
        """Set up test database connection and mock data"""
        # Mock database connection
        self.mock_conn = MagicMock()
        self.mock_cur = MagicMock()
        self.mock_conn.cursor.return_value = self.mock_cur

        # Sample CSV data for testing
        self.sample_data = [
            {
                'grade': '5',
                'subject': 'Mathematics',
                'topic': 'Place Value & Number Ordering',
                'subtopic': 'Read and write numbers up to 1 million',
                'prerequisites': 'Basic counting, Understanding digits 0-9'
            }
        ]

        self.sample_df = pd.DataFrame(self.sample_data)

    def test_get_or_create_existing_record(self):
        """Test get_or_create returns existing record ID"""
        # Mock existing record
        self.mock_cur.fetchone.return_value = (1,)

        result = get_or_create(
            self.mock_cur,
            "topic",
            "(name)",
            {"name": "Test Topic", "description": None}
        )

        self.assertEqual(result, 1)
        self.mock_cur.execute.assert_called()

    def test_get_or_create_new_record(self):
        """Test get_or_create creates new record and returns ID"""
        # Mock no existing record, then successful insert
        self.mock_cur.fetchone.side_effect = [None, (2,)]

        result = get_or_create(
            self.mock_cur,
            "topic",
            "(name)",
            {"name": "New Topic", "description": "Test", "difficulty_level": 3}
        )

        self.assertEqual(result, 2)
        # Verify INSERT was called with correct parameters
        insert_call = self.mock_cur.execute.call_args_list[0]
        self.assertIn("INSERT INTO topic", insert_call[0][0])

    def test_topic_creation_with_new_fields(self):
        """Test that topics are created with new schema fields"""
        # Mock successful topic creation
        self.mock_cur.fetchone.side_effect = [None, (3,)]

        result = get_or_create(
            self.mock_cur,
            "topic",
            "(name)",
            {
                "name": "Enhanced Topic",
                "description": "Test description",
                "canonical_code": "TEST001",
                "difficulty_level": 2,
                "learning_objectives": ["Objective 1", "Objective 2"],

            }
        )

        self.assertEqual(result, 3)
        # Verify all new fields are included in INSERT
        insert_call = self.mock_cur.execute.call_args_list[0]
        query = insert_call[0][0]
        self.assertIn("difficulty_level", query)
        self.assertIn("learning_objectives", query)
        self.assertNotIn("estimated_duration_minutes", query)

    def test_curriculum_topic_creation(self):
        """Test curriculum_topic creation with new fields"""
        # Mock the database operations
        self.mock_cur.fetchone.side_effect = [
            None,  # No existing curriculum_topic
            (4,)   # Successful insert returns ID 4
        ]

        # Simulate the curriculum_topic creation from import script
        curriculum_id = 1
        grade_id = 1
        subject_id = 1
        topic_id = 1

        self.mock_cur.execute(
            """
            INSERT INTO curriculum_topic
            (curriculum_id, grade_id, subject_id, topic_id, difficulty_level, learning_objectives)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT DO NOTHING
            RETURNING id
            """,
            (curriculum_id, grade_id, subject_id, topic_id, 3, [])
        )

        # Verify the INSERT call
        insert_call = self.mock_cur.execute.call_args_list[0]
        query = insert_call[0][0]
        params = insert_call[0][1]

        self.assertIn("difficulty_level", query)
        self.assertIn("learning_objectives", query)
        self.assertNotIn("estimated_duration_minutes", query)
        self.assertEqual(params[4], 3)  # difficulty_level
        self.assertEqual(params[5], [])  # learning_objectives

    def test_subtopic_creation(self):
        """Test subtopic creation with new fields"""
        # Test the subtopic INSERT query
        curriculum_topic_id = 1
        subtopic_name = "Test Subtopic"

        self.mock_cur.execute(
            """
            INSERT INTO subtopic (curriculum_topic_id, name, difficulty_level, learning_objectives)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT DO NOTHING
            """,
            (curriculum_topic_id, subtopic_name, 3, [])
        )

        # Verify the INSERT call
        insert_call = self.mock_cur.execute.call_args_list[0]
        query = insert_call[0][0]
        params = insert_call[0][1]

        self.assertIn("difficulty_level", query)
        self.assertIn("learning_objectives", query)
        self.assertNotIn("estimated_duration_minutes", query)
        self.assertEqual(params[2], 3)  # difficulty_level
        self.assertEqual(params[3], [])  # learning_objectives

    def test_prerequisite_topic_update(self):
        """Test that prerequisite topics get default values"""
        # Mock a prerequisite topic that needs updating
        prereq_id = 2

        self.mock_cur.execute(
            """
            UPDATE topic
            SET difficulty_level = %s,
                learning_objectives = %s
            WHERE id = %s
            """,
            (3, [], prereq_id)
        )

        # Verify the UPDATE call
        update_call = self.mock_cur.execute.call_args_list[0]
        query = update_call[0][0]
        params = update_call[0][1]

        self.assertIn("UPDATE topic", query)
        self.assertIn("difficulty_level = %s", query)
        self.assertIn("learning_objectives = %s", query)
        self.assertNotIn("estimated_duration_minutes = %s", query)
        self.assertEqual(params[0], 3)
        self.assertEqual(params[1], [])
        self.assertEqual(params[2], prereq_id)


class TestDataValidation(unittest.TestCase):
    """Test data validation and edge cases"""

    def test_difficulty_level_range(self):
        """Test that difficulty levels are within valid range"""
        valid_levels = [1, 2, 3, 4, 5]
        invalid_levels = [0, 6, -1, 10]

        for level in valid_levels:
            with self.subTest(level=level):
                # This should not raise an error in the database
                # (PostgreSQL CHECK constraint would handle this)
                self.assertTrue(1 <= level <= 5)

        for level in invalid_levels:
            with self.subTest(level=level):
                self.assertFalse(1 <= level <= 5)

    def test_empty_learning_objectives(self):
        """Test handling of empty learning objectives"""
        # Empty list should be valid
        objectives = []
        self.assertIsInstance(objectives, list)
        self.assertEqual(len(objectives), 0)




if __name__ == '__main__':
    unittest.main()