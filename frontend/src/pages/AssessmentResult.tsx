import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useParams } from "react-router-dom";

export const AssessmentResult: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [assessment, setAssessment] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const res = await api.get(`/api/v1/assessments/${id}`);
      setAssessment(res.data);
    })();
  }, [id]);

  if (!assessment) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold">Assessment Result</h1>
      <p className="mt-2">Score: {assessment.overall_score ?? "N/A"}</p>
      <h2 className="mt-4 text-xl">Recommendations</h2>
      <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(assessment.recommendations, null, 2)}</pre>
    </div>
  );
};
