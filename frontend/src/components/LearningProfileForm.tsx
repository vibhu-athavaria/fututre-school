import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface LearningProfileFormProps {
  onSubmit: (data: {
    interests: string[];
    preferred_format: string;
    preferred_session_length: number;
  }) => void;
  onSkip?: () => void;
  initialData?: {
    interests?: string[];
    preferred_format?: string;
    preferred_session_length?: number;
  };
}

const INTEREST_OPTIONS = [
  'Science',
  'Technology',
  'Engineering',
  'Mathematics',
  'Arts',
  'Sports',
  'Music',
  'Literature',
  'History',
  'Geography',
  'Languages',
  'Business',
  'Health',
  'Environment',
  'Other'
];

const FORMAT_OPTIONS = ['Video', 'Text', 'Interactive', 'Audio'];
const SESSION_LENGTH_OPTIONS = [15, 30, 45, 60];

const LearningProfileForm: React.FC<LearningProfileFormProps> = ({
  onSubmit,
  onSkip,
  initialData = {}
}) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    initialData.interests || []
  );
  const [otherInterest, setOtherInterest] = useState('');
  const [preferredFormat, setPreferredFormat] = useState(
    initialData.preferred_format || ''
  );
  const [preferredSessionLength, setPreferredSessionLength] = useState(
    initialData.preferred_session_length || 30
  );

  const handleInterestChange = (interest: string, checked: boolean) => {
    if (checked) {
      setSelectedInterests([...selectedInterests, interest]);
    } else {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const interests = selectedInterests.includes('Other')
      ? [...selectedInterests.filter(i => i !== 'Other'), otherInterest].filter(Boolean)
      : selectedInterests;
    onSubmit({
      interests,
      preferred_format: preferredFormat,
      preferred_session_length: preferredSessionLength
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-blue-600">Learning Profile</CardTitle>
        <p className="text-sm text-gray-600">
          Help us personalize your child's learning experience by selecting their interests and preferences.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What are your child's interests? (Select all that apply)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {INTEREST_OPTIONS.map(interest => (
                <label key={interest} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedInterests.includes(interest)}
                    onChange={(e) => handleInterestChange(interest, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{interest}</span>
                </label>
              ))}
            </div>
            {selectedInterests.includes('Other') && (
              <input
                type="text"
                value={otherInterest}
                onChange={(e) => setOtherInterest(e.target.value)}
                placeholder="Please specify"
                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            )}
          </div>

          {/* Preferred Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred learning format
            </label>
            <div className="space-y-2">
              {FORMAT_OPTIONS.map(format => (
                <label key={format} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="format"
                    value={format}
                    checked={preferredFormat === format}
                    onChange={(e) => setPreferredFormat(e.target.value)}
                    className="border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{format}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Preferred Session Length */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred session length (minutes)
            </label>
            <div className="space-y-2">
              {SESSION_LENGTH_OPTIONS.map(length => (
                <label key={length} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="sessionLength"
                    value={length}
                    checked={preferredSessionLength === length}
                    onChange={(e) => setPreferredSessionLength(Number(e.target.value))}
                    className="border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{length} minutes</span>
                </label>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-4">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Profile
            </Button>
            {onSkip && (
              <Button
                type="button"
                variant="outline"
                onClick={onSkip}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Skip for Now
              </Button>
            )}
          </div>
          {onSkip && (
            <p className="text-xs text-gray-500">
              Note: You can complete this later, but it helps us provide better recommendations.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default LearningProfileForm;