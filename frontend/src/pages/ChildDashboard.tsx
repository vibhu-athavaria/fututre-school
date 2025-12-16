"use client";

import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Beaker,
  Edit3,
  Globe2,
  Trophy,
  Star,
  Zap,
  Target,
  Award,
  Lock,
  Sparkles,
  PlayCircle,
  FileText,
  ArrowRight
} from "lucide-react";
import { Child } from "../types";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import axios from "axios";

// Types
type Subject = "Math" | "Science" | "English" | "Humanities";
type AssessmentStatus = "not_started" | "in_progress" | "completed";

interface SubjectData {
  name: Subject;
  icon: any;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  status: AssessmentStatus;
  assessment_id?: number;
  progress?: number; // For in-progress state (0-100)
  level?: string; // For completed state (e.g., "A2", "B1")
  description: string;
}

interface Badge {
  id: string;
  name: string;
  icon: any;
  unlocked: boolean;
  color: string;
}

export const ChildDashboard: React.FC = () => {
  // child data from backend
  const [child, setChild] = useState<Child | null>(null);

  // Static UI fields per subject (never overridden by backend)
  const UI_FIELDS: Record<
    Subject,
    Omit<SubjectData, "status" | "progress" | "level" | "description" | "name">
  > = {
    Math: {
      icon: BookOpen,
      color: "blue",
      gradientFrom: "from-blue-500",
      gradientTo: "to-cyan-500",
    },
    English: {
      icon: Edit3,
      color: "purple",
      gradientFrom: "from-purple-500",
      gradientTo: "to-pink-500",
    },
    Science: {
      icon: Beaker,
      color: "emerald",
      gradientFrom: "from-emerald-500",
      gradientTo: "to-teal-500",
    },
    Humanities: {
      icon: Globe2,
      color: "orange",
      gradientFrom: "from-orange-500",
      gradientTo: "to-red-500",
    },
  };

  // build a deterministic initial state (so UI doesn't crash)
  const initialSubjectsData = ((): Record<Subject, SubjectData> => {
    const subjects = {} as Record<Subject, SubjectData>;
    (Object.keys(UI_FIELDS) as Subject[]).forEach((sub) => {
      subjects[sub] = {
        name: sub,
        icon: UI_FIELDS[sub].icon,
        color: UI_FIELDS[sub].color,
        gradientFrom: UI_FIELDS[sub].gradientFrom,
        gradientTo: UI_FIELDS[sub].gradientTo,
        status: "not_started",
        description: `Start your diagnostic test to discover your ${sub} level.`,
      };
    });
    return subjects;
  })();

  const [subjectsData, setSubjectsData] =
    useState<Record<Subject, SubjectData>>(initialSubjectsData);

  const [badges] = useState<Badge[]>([
    {
      id: "1",
      name: "Quick Starter",
      icon: Zap,
      unlocked: true,
      color: "yellow",
    },
    { id: "2", name: "First Steps", icon: Star, unlocked: true, color: "blue" },
    {
      id: "3",
      name: "Math Master",
      icon: Trophy,
      unlocked: false,
      color: "purple",
    },
    {
      id: "4",
      name: "Science Explorer",
      icon: Beaker,
      unlocked: true,
      color: "green",
    },
    {
      id: "5",
      name: "Reading Champion",
      icon: BookOpen,
      unlocked: false,
      color: "pink",
    },
    {
      id: "6",
      name: "Goal Achiever",
      icon: Target,
      unlocked: false,
      color: "orange",
    },
    {
      id: "7",
      name: "Perfect Score",
      icon: Award,
      unlocked: false,
      color: "red",
    },
    {
      id: "8",
      name: "Creative Thinker",
      icon: Sparkles,
      unlocked: false,
      color: "indigo",
    },
  ]);

  const badgeColorMap: Record<string, string> = {
    yellow: "from-yellow-400 to-yellow-600",
    blue: "from-blue-400 to-blue-600",
    purple: "from-purple-400 to-purple-600",
    green: "from-green-400 to-green-600",
    pink: "from-pink-400 to-pink-600",
    orange: "from-orange-400 to-orange-600",
    red: "from-red-400 to-red-600",
    indigo: "from-indigo-400 to-indigo-600",
  };

  // Navigation handlers
  const handleTakeAssessment = (subject: Subject) => {
    console.log(`Starting assessment for ${subject}`);
    window.location.href = `/child-dashboard/assessment?subject=${subject}`;
  };

  const handleResumeAssessment = (subject: Subject) => {
    console.log(`Resuming assessment for ${subject}`);
    window.location.href = `/child-dashboard/assessment?subject=${subject}&resume=true`;
  };

  const handleShowReport = (assessment_id: number) => {
    window.location.href = `/child-dashboard/assessment-diagnostic-report?assessmentId=${assessment_id}`;
  };

  const handleStartCourse = (subject: Subject) => {
    console.log(`Starting course for ${subject}`);
    window.location.href = `/child-dashboard/take-micro-course?subject=${subject}`;
  };

  // Map backend assessment -> partial SubjectData (only dynamic fields)
  const fillSubjectData = (
    subject: Subject,
    apiData: any
  ): Partial<SubjectData> => {
    const assessment = apiData?.assessments?.[subject];
    if (!assessment) {
      return {
        status: "not_started",
        assessment_id: undefined,
        description: `Start your diagnostic test to discover your ${subject} level.`,
      };
    }

    const status = String(assessment.status || "").toLowerCase();
    if (status === "completed") {
      return {
        status: "completed",
        level: assessment.level,
        assessment_id: assessment.assessment_id,
        description: "Great job! You've completed your diagnostic assessment.",
      };
    }

    if (status === "in_progress") {
      return {
        status: "in_progress",
        progress: assessment.progress ?? 0,
        assessment_id: assessment.assessment_id,
        description: `You're ${
          assessment.progress ?? 0
        }% through your diagnostic assessment!`,
      };
    }

    // fallback
    return {
      status: "not_started",
      description: `Start your diagnostic test to discover your ${subject} level.`,
    };
  };

  // Update all subjects from backend data (merges static UI + dynamic fields)
  const updateAllSubjectsFromBackend = (apiData: any) => {
    setSubjectsData((prev) => {
      const newState = {} as Record<Subject, SubjectData>;
      (Object.keys(UI_FIELDS) as Subject[]).forEach((sub) => {
        newState[sub] = {
          name: sub,
          icon: UI_FIELDS[sub].icon,
          color: UI_FIELDS[sub].color,
          gradientFrom: UI_FIELDS[sub].gradientFrom,
          gradientTo: UI_FIELDS[sub].gradientTo,
          // defaults overwritten by fillSubjectData
          ...(prev[sub] ?? { status: "not-started", description: "" }),
          ...fillSubjectData(sub, apiData),
        } as SubjectData;
      });
      return newState;
    });
  };

  // Fetch student data once
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const localUser = localStorage.getItem("user");

    if (!token || !localUser) {
      console.warn("Missing token/user");
      window.location.href = "/student-login";
      return;
    }

    let parsedUser: any = null;
    try {
      parsedUser = JSON.parse(localUser);
      if (!parsedUser?.role || parsedUser.role.toLowerCase() !== "student") {
        console.error("User is not a student");
        window.location.href = "/student-login";
        return;
      }
    } catch (err) {
      console.error("Invalid user JSON");
      window.location.href = "/student-login";
      return;
    }

    const studentId = parsedUser?.student_profile?.id;
    if (!studentId) {
      console.warn("No student profile found");
      return;
    }

    const fetchStudent = async () => {
      try {
        const res = await axios.get(`/api/v1/students/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status !== 200) {
          console.error("API error", res.status);
          return;
        }

        const data = res.data;
        console.log("Student data:", data);

        setChild(data);

        // Update subjects using the API data (merge UI fields + dynamic)
        updateAllSubjectsFromBackend(data);
      } catch (err) {
        console.error("Error fetching student", err);
      }
    };

    fetchStudent();
  }, []);

  // safe fallbacks for header
  if (!child) return null;

  const childName = child.user.full_name;
  const grade = child.grade_level;

  // rendering helpers
  const renderSubjectCard = (subjectData: SubjectData, index: number) => {
    const Icon = subjectData.icon;

    return (
      <motion.div
        key={subjectData.name}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.08 }}
        className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent"
      >
        {/* Card Header with Gradient */}
        <div
          className={`bg-gradient-to-r ${subjectData.gradientFrom} ${subjectData.gradientTo} p-6 text-white`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Icon className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold">{subjectData.name}</h3>
            </div>
            {subjectData.status === "completed" && (
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  Level {subjectData.level}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6">
          <p className="text-gray-600 mb-4">{subjectData.description}</p>

          {/* Progress Bar for In-Progress State */}
          {subjectData.status === "in_progress" &&
            subjectData.progress !== undefined && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">
                    Progress
                  </span>
                  <span className="text-sm font-bold text-blue-600">
                    {subjectData.progress}%
                  </span>
                </div>
                <Progress value={subjectData.progress} className="h-3" />
              </div>
            )}

          {/* Action Buttons based on State */}
          <div className="flex flex-col gap-3">
            {/* State A: Not Started */}
            {subjectData.status === "not_started" && (
              <button
                onClick={() => handleTakeAssessment(subjectData.name)}
                className={`w-full bg-gradient-to-r ${subjectData.gradientFrom} ${subjectData.gradientTo} text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transform transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2`}
              >
                <PlayCircle className="w-5 h-5" />
                Take Assessment
              </button>
            )}

            {/* State B: In Progress */}
            {subjectData.status === "in_progress" && (
              <button
                onClick={() => handleResumeAssessment(subjectData.name)}
                className={`w-full bg-gradient-to-r ${subjectData.gradientFrom} ${subjectData.gradientTo} text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transform transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2`}
              >
                <PlayCircle className="w-5 h-5" />
                Resume Assessment
              </button>
            )}

            {/* State C: Completed */}
            {subjectData.status === "completed" && (
              <>
                <button
                  onClick={() =>
                    handleShowReport(
                      subjectData.assessment_id ? subjectData.assessment_id : 0
                    )
                  }
                  className="w-full bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  Show Diagnostic Report
                </button>
                <button
                  onClick={() => handleStartCourse(subjectData.name)}
                  className={`w-full bg-gradient-to-r ${subjectData.gradientFrom} ${subjectData.gradientTo} text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transform transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2`}
                >
                  <ArrowRight className="w-5 h-5" />
                  Start {subjectData.name} Course
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">
                  {childName.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {childName}!
                </h1>
                <p className="text-gray-600">
                  Grade {grade} • Choose a subject to continue your learning
                  journey
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full shadow-md">
              <Trophy className="w-5 h-5" />
              <span className="font-semibold">3 Badges Earned</span>
            </div>
          </div>
        </motion.div>

        {/* Subject Cards Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-blue-600" />
            Your Subjects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.values(subjectsData).map((subject, index) =>
              renderSubjectCard(subject, index)
            )}
          </div>
        </div>

        {/* Badges Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-7 h-7 text-purple-600" />
              Your Badges
            </h2>
            <button className="text-blue-600 font-semibold hover:text-blue-700 transition-colors flex items-center gap-1">
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
            {badges.map((badge, index) => {
              const BadgeIcon = badge.icon;
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: badge.unlocked ? 1.1 : 1 }}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 ${
                    badge.unlocked
                      ? "bg-gradient-to-br from-yellow-50 to-orange-50 hover:shadow-md cursor-pointer"
                      : "bg-gray-100 opacity-60"
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md ${
                      badge.unlocked
                        ? `bg-gradient-to-br ${badgeColorMap[badge.color]}`
                        : "bg-gray-300"
                    }`}
                  >
                    {badge.unlocked ? (
                      <BadgeIcon className="w-7 h-7 text-white" />
                    ) : (
                      <Lock className="w-7 h-7 text-gray-500" />
                    )}
                  </div>
                  <span
                    className={`text-xs text-center font-semibold ${
                      badge.unlocked ? "text-gray-700" : "text-gray-500"
                    }`}
                  >
                    {badge.name}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Motivational Message */}
          <div className="mt-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                Keep up the great work!
              </p>
              <p className="text-sm text-gray-600">
                Complete more assessments and courses to unlock new badges.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildDashboard;
