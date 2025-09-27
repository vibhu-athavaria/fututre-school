import React, { useEffect, useState } from "react";
import api from "../services/api";

type Question = any; // adapt to shape from backend

export const AssessmentRunner: React.FC<{ assessmentId: number }> = ({ assessmentId }) => {
  const [assessment, setAssessment] = useState<any | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/api/v1/assessments/${assessmentId}`);
        setAssessment(res.data);
        const first = (res.data.questions || []).find((q: any)=>!q.student_answer) || null;
        setCurrentQuestion(first);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [assessmentId]);

  if (loading) return <div>Loading...</div>;
  if (!currentQuestion) return <div>No current question — maybe assessment is completed.</div>;

  const submit = async () => {
    try {
      const res = await api.post(`/api/v1/assessments/${assessmentId}/questions/${currentQuestion.id}/answer`, { answer_text: answer, time_taken: 30 });
      const data = res.data;
      if (data.next_question) {
        setCurrentQuestion(data.next_question);
        setAnswer("");
      } else {
        window.location.href = `/assessment/result/${assessmentId}`;
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Question {currentQuestion.question_number}</h2>
      <p className="mb-4">{currentQuestion.question_text}</p>
      {currentQuestion.options?.length ? (
        <div>
          {currentQuestion.options.map((opt:string)=>(
            <label key={opt} className="block p-2 border rounded mb-2">
              <input type="radio" name="opt" value={opt} checked={answer===opt} onChange={()=>setAnswer(opt)} /> {opt}
            </label>
          ))}
        </div>
      ) : (
        <textarea value={answer} onChange={(e)=>setAnswer(e.target.value)} className="w-full p-2 border rounded" />
      )}
      <button onClick={submit} className="bg-blue-600 text-white rounded px-4 py-2 mt-4">Submit</button>
    </div>
  );
};

export default AssessmentRunner;
