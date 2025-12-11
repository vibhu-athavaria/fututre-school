"use client";

import React, { useEffect, useState } from "react";
import { BookOpen, Beaker, Edit3, Globe2 } from "lucide-react";
import { Child } from "../types";
import { SUBJECTS } from "../lib/utils";
import axios from "axios";
import { ChildDashboard_DiagnosticSummary } from "./ChildDashboard_DiagnosticSummary";

const subjectIcons = {
  Math: BookOpen,
  Science: Beaker,
  English: Edit3,
  Humanities: Globe2,
};

type Subject = "Math" | "Science" | "English" | "Humanities";

interface StudyPlanItem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
}

export const ChildDashboard: React.FC = () => {
  const [child, setChild] = useState<Child | null>(null);
  const [activeSubject, setActiveSubject] = useState<Subject>(
    SUBJECTS[0] as Subject
  );
  const [completedAssessments, setCompletedAssessments] = useState<
    Record<Subject, boolean>
  >({
    Math: false,
    Science: false,
    English: false,
    Humanities: false,
  });

  const [studyPlans, setStudyPlans] = useState<
    Record<Subject, StudyPlanItem[]>
  >({
    Math: {},
    Science: {},
    English: {},
    Humanities: {},
  });

  const [assessmentReports, setAssessmentReports] = useState<
    Record<string, any>
  >({});

useEffect(() => {
  const token = localStorage.getItem("access_token")
  const localUser = localStorage.getItem("user")

  // Run checks once only
  if (!token || !localUser) {
    console.warn("Missing token/user")
    return
  }

  let parsedUser: any = null
  try {
    parsedUser = JSON.parse(localUser)
  } catch (err) {
    console.error("Bad user JSON")
    return
  }

  const studentId = parsedUser?.student_profile?.id
  if (!studentId) {
    console.warn("No student profile found")
    return
  }

  // Fetch student data
  const fetchStudent = async () => {
    try {
      const res = await axios.get(`/api/v1/students/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.status !== 200) {
        console.error("API error", res.status)
        return
      }

      const data = res.data
      console.log("Student data:", data)

      setChild(data)

      const isCompleted = (subject: string) => {
        const assessment = data.assessments?.[subject];
        return assessment?.status?.toLowerCase() === "completed";
      };

      // Assessments
      setCompletedAssessments({
        Math: isCompleted("Math"),
        Science: isCompleted("Science"),
        English: isCompleted("English"),
        Humanities: isCompleted("Humanities"),
      });

      // Study Plans (backend or fallback)
      setStudyPlans(
        data.study_plans ?? {
          Math: {},
          Science: {},
          English: {},
          Humanities: {},
        }
      )
    } catch (err) {
      console.error("Error fetching student", err)
    }
  }

  fetchStudent()
}, [])


  const handleStartAssessment = (subject: Subject) => {
    window.location.href = `/child-dashboard/assessment?subject=${subject}`;
  };

  if (!child) return null;

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {child.user?.full_name}! (Grade {child.grade_level})
          </h1>
          <p className="text-gray-600">
            Choose a subject to continue your learning journey.
          </p>
        </div>

        {/* Subject Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 flex space-x-6 overflow-x-auto">
            {SUBJECTS.map((subject) => (
              <button
                key={subject}
                onClick={() => setActiveSubject(subject as Subject)}
                className={`py-2 px-1 font-medium text-sm border-b-2 transition-all ${
                  activeSubject === subject
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        {/* Active Tab Content */}
        <div>
          {!child.assessments?.[activeSubject] ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
              <div className="flex flex-col items-center space-y-4">
                {React.createElement(subjectIcons[activeSubject], {
                  className: "w-12 h-12 text-blue-600",
                })}
                <h2 className="text-2xl font-semibold text-gray-900">
                  {activeSubject} Assessment
                </h2>
                <p className="text-gray-600 max-w-md">
                  Take the assessment to find your current level and unlock a
                  personalized study plan for {activeSubject}.
                </p>
                <button
                  onClick={() => handleStartAssessment(activeSubject)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-all duration-200"
                >
                  Start {activeSubject} Assessment
                </button>
              </div>
            </div>
          ) : (
            <div>
                <ChildDashboard_DiagnosticSummary
                  subject={activeSubject}
                  assessmentId={child.assessments?.[activeSubject]?.assessment_id}
                  cachedReport={assessmentReports[child.assessments?.[activeSubject]?.assessment_id]}
                  onCacheReport={(assessmentId, data) =>
                    setAssessmentReports((prev) => ({ ...prev, [assessmentId]: data }))
                  }
                  onStartCourse={() => window.location.href = `/take-micro-course?subject=${activeSubject}`}
                />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChildDashboard;
