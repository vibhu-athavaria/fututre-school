# app/services/llm_service.py
import os
import json
import re
import random
import logging
import unicodedata
from typing import Dict, Any, Optional
from app.core.config import settings

import httpx

logger = logging.getLogger(__name__)


class LLMService:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER.lower()
        self.openai_api_key = settings.OPENAI_API_KEY
        self.gemini_api_key = settings.GEMINI_API_KEY


    def _safe_parse_gemini_response(self, raw_text: str):
        """
        Cleans noisy Gemini JSON output and safely parses it into a Python dict.
        Returns None if parsing fails after cleanup.
        """
        try:
            # 1️⃣ Remove Markdown formatting (```json ... ```)
            cleaned = re.sub(r"^```(?:json)?|```$", "", raw_text.strip(), flags=re.MULTILINE).strip()

            # 2️⃣ Normalize Unicode (remove invisible / weird chars)
            cleaned = unicodedata.normalize("NFKD", cleaned)
            cleaned = re.sub(r"[^\x00-\x7F]+", " ", cleaned)  # keep ASCII only

            # 3️⃣ Remove stray characters after closing brackets
            cleaned = re.sub(r']\s*[^,\]}]*', ']', cleaned)
            cleaned = re.sub(r'}\s*[^}]*$', '}', cleaned)

            # 4️⃣ Fix trailing commas
            cleaned = re.sub(r',\s*([\]}])', r'\1', cleaned)

            # 5️⃣ Parse JSON
            return json.loads(cleaned)

        except Exception as e:
            print("⚠️ Could not parse Gemini JSON directly. Raw text:")
            print(raw_text)
            print(f"Parser error: {e}")
            return None


    # ---------------------
    # Question generation
    # ---------------------
    async def generate_question(
        self, subject: str, grade_level: str, topic: Optional[str], difficulty_level: str
    ) -> Dict[str, Any]:
        """
        Returns validated dict keys:
        - question_text, question_type, options (optional), correct_answer, subject, subtopic, difficulty_level, learning_objectives, description, prerequisites
        """

        if self.provider == "mock":
            choices = ["A", "B", "C", "D"]
            correct = random.choice(choices)
            return {
                "question_text": f"Mock: {subject} ({topic}) - difficulty {difficulty_level}",
                "question_type": "multiple_choice",
                "options": choices,
                "correct_answer": correct,
                "subject": subject,
                "topic": None,
                "difficulty_level": difficulty_level,
            }

        prompt = f"""
            Generate EXACTLY 1 {subject} assessment question for Grade {grade_level} with difficulty '{difficulty_level}'.
            Follow ALL rules strictly.

            1. The question MUST be appropriate for Grade {grade_level} in terms of vocabulary, complexity, and domain knowledge.

            2. The subject MUST be strictly followed: {subject}.
            No cross-subject content.

            3. The difficulty level MUST reflect '{difficulty_level}'.

            4. The question type MUST be one of: 'MCQ' and 'True/False'.

            5. If question_type = 'MCQ':
            - Provide 4 unique answer options.
            - correct_answer MUST match exactly one option.

            6. If question_type = 'True/False':
            - No 'options'.
            - correct_answer MUST be 'True' or 'False'.
            7. The question MUST be relevant to the topic: {topic or "General"}.

            8. Output STRICT JSON ONLY:
            {{
            "question_text": "",
            "question_type": "",
            "options": [],
            "correct_answer": "",
            "subject": "",
            "sub_topic": "",
            "difficulty_level": "",
            "learning_objectives": [],
            "description": "",
            "prerequisites": []
            }}
            """

        logger.debug("LLM Question Prompt: %s", prompt)
        print("LLM Question Prompt: ", prompt)

        if self.provider == "openai":
            try:
                from openai import OpenAI
                client = OpenAI(api_key=self.openai_api_key)

                resp = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "You are an educational question generator."},
                        {"role": "user", "content": prompt},
                    ],
                    max_tokens=400,
                )
                text = resp.choices[0].message["content"]
                data = json.loads(text)
                return data
            except Exception as e:
                logger.exception("Failed to generate or parse OpenAI question")
                raise

        elif self.provider == "gemini":
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.gemini_api_key}"
                headers = {"Content-Type": "application/json"}
                payload = {
                    "contents": [{"parts": [{"text": json.dumps(prompt)}]}],
                }

                async with httpx.AsyncClient(timeout=60) as client:
                    resp = await client.post(url, headers=headers, json=payload)
                    print("Gemini response:", resp.text)
                    resp.raise_for_status()
                    data = resp.json()

                text = (
                    data.get("candidates", [{}])[0]
                    .get("content", {})
                    .get("parts", [{}])[0]
                    .get("text", "")
                    .strip()
                )
                # --- Clean up Markdown code fences ---

                try:
                    logger.debug("LLM Question Prompt: %s", text)
                    return self._safe_parse_gemini_response(text)
                except json.JSONDecodeError:
                    logger.warning("⚠️ Could not parse Gemini JSON directly. Raw text:\n%s", text)
                    # Fallback: wrap raw text in a basic dict
                    return {"question_text": text, "question_type": "open", "options": [], "correct_answer": "", "topic": topic or "General", "subtopic": None, "difficulty_level": difficulty_level}
            except Exception as e:
                logger.exception("Failed to generate or parse Gemini question")
                raise

        else:
            raise NotImplementedError(f"LLM provider {self.provider} not implemented")

    # ---------------------
    # Answer scoring
    # ---------------------
    async def score_answer(self, question: Dict[str, Any], student_answer: str) -> Dict[str, Any]:
        """
        Return: { is_correct: bool, score: float (0-1), feedback: str }
        """
        if self.provider == "mock":
            correct = str(question.get("correct_answer", "")).strip().lower()
            ans = (student_answer or "").strip().lower()
            is_correct = False
            if question.get("question_type") == "multiple_choice":
                is_correct = ans == correct.lower()
            else:
                is_correct = correct and (correct in ans)
            return {
                "is_correct": bool(is_correct),
                "score": 1.0 if is_correct else 0.0,
                "feedback": "Correct!" if is_correct else "Not quite — review the concept.",
            }

        grading_prompt = (
            "Grade the student's answer. "
            f"Question: {question.get('question_text')}\n"
            f"Correct answer: {question.get('correct_answer')}\n"
            f"Student answer: {student_answer}\n"
            "Output only JSON with keys: {is_correct: bool, score: float, feedback: str}"
        )

        if self.provider == "openai":
            try:
                from openai import OpenAI
                client = OpenAI(api_key=self.openai_api_key)
                resp = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "You are an objective grader."},
                        {"role": "user", "content": grading_prompt},
                    ],
                    max_tokens=256,
                )
                text = resp.choices[0].message["content"]
                return json.loads(text)
            except Exception:
                logger.exception("OpenAI grading parse error")
                raise

        elif self.provider == "gemini":
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_api_key}"
                headers = {"Content-Type": "application/json"}
                payload = {"contents": [{"parts": [{"text": grading_prompt}]}]}

                async with httpx.AsyncClient(timeout=60) as client:
                    resp = await client.post(url, headers=headers, json=payload)
                    resp.raise_for_status()
                    data = resp.json()

                text = (
                    data.get("candidates", [{}])[0]
                    .get("content", {})
                    .get("parts", [{}])[0]
                    .get("text", "")
                    .strip()
                )
                return json.loads(text)
            except Exception:
                logger.exception("Gemini grading parse error")
                raise

        raise NotImplementedError(f"LLM provider {self.provider} not implemented")

    # ---------------------
    # Study plan generation
    # ---------------------
    async def generate_study_plan(
        self, mastery_map: Dict[str, float], subject: str, grade_level: str, top_n: int = 5
    ) -> Dict[str, Any]:
        if self.provider == "mock":
            items = sorted(mastery_map.items(), key=lambda x: x[1])[:top_n]
            lessons = []
            for week, (topic, score) in enumerate(items, start=1):
                lessons.append(
                    {
                        "title": f"Practice {topic}",
                        "topic": topic,
                        "suggested_duration_mins": 20,
                        "week": week,
                        "details": f"Work through fundamentals of {topic}. 3 practice problems, 1 short quiz.",
                    }
                )
            return {
                "summary": f"Focus on {', '.join([t for t, _ in items])}",
                "lessons": lessons,
            }

        study_prompt = (
            f"Generate a {subject} study plan for {grade_level} student. "
            f"Mastery map: {json.dumps(mastery_map)}. Focus on weakest {top_n} topics. "
            "Return JSON: {summary: str, lessons: [{title, topic, suggested_duration_mins, week, details}]}"
        )

        if self.provider == "openai":
            from openai import OpenAI
            client = OpenAI(api_key=self.openai_api_key)
            resp = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": study_prompt}],
                max_tokens=512,
            )
            return json.loads(resp.choices[0].message["content"])

        elif self.provider == "gemini":
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_api_key}"
            headers = {"Content-Type": "application/json"}
            payload = {"contents": [{"parts": [{"text": study_prompt}]}]}

            async with httpx.AsyncClient(timeout=60) as client:
                resp = await client.post(url, headers=headers, json=payload)
                resp.raise_for_status()
                data = resp.json()

            text = (
                data.get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [{}])[0]
                .get("text", "")
                .strip()
            )
            return json.loads(text)

        raise NotImplementedError(f"LLM provider {self.provider} not implemented")


# Singleton
llm_service = LLMService()
