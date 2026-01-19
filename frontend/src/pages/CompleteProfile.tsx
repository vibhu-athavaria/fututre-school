import React from 'react';
import { useNavigate } from 'react-router-dom';
import LearningProfileForm from '../components/LearningProfileForm';
import { http } from '@/lib/http';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { User } from 'lucide-react';

const CompleteProfile: React.FC = () => {
  const navigate = useNavigate();

  const handleProfileSubmit = async (profileData: {
    interests: string[];
    preferred_format: string;
    preferred_session_length: number;
  }) => {
    try {
      const currentChild = JSON.parse(localStorage.getItem('currentChild') || '{}');
      await http.patch(`/api/v1/students/${currentChild.id}/learning-profile`, {
        ...profileData,
        profile_completed: true
      });
      // Update local storage
      const updatedChild = { ...currentChild, ...profileData, profile_completed: true };
      localStorage.setItem('currentChild', JSON.stringify(updatedChild));
      // Update in children list
      const children = JSON.parse(localStorage.getItem('children') || '[]');
      const updatedChildren = children.map((c: any) => c.id === currentChild.id ? updatedChild : c);
      localStorage.setItem('children', JSON.stringify(updatedChildren));
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to save learning profile:', err);
      alert('Failed to save learning profile. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full mx-auto">
        <div className="mb-6">
          <Breadcrumb role="student" items={[{ label: 'Complete Profile', icon: User }]} />
        </div>
        <LearningProfileForm
          onSubmit={handleProfileSubmit}
        />
      </div>
    </div>
  );
};

export default CompleteProfile;