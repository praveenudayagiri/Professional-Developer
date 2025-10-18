import React, { useState, useEffect } from 'react';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: '',
    gradeLevel: '',
    subject: '',
    customSubject: '',
    primaryGoal: '',   // ✅ new field
    teachingGoals: '',
    availableTime: '',
    budget: '',
    experienceLevel: 'intermediate',
    preferredFormat: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const gradeLevelOptions = [
    'Elementary (K-5)',
    'Middle School (6-8)',
    'High School (9-12)',
    'College/University',
    'Adult Education'
  ];

  const subjectOptions = [
    'Mathematics',
    'Science',
    'English/Language Arts',
    'Social Studies',
    'Art',
    'Music',
    'Physical Education',
    'Technology',
    'Special Education',
    'ESL/EFL',
    'Other'
  ];

  const formatOptions = [
    'Online Workshops',
    'In-Person Training',
    'Self-Paced Courses',
    'Webinars',
    'Articles/Guides',
    'Video Tutorials',
    'Peer Collaboration'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMultiSelectChange = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const finalProfile = {
        ...profile,
        subject:
          profile.subject === 'Other' ? profile.customSubject : profile.subject
      };

      localStorage.setItem('educatorProfile', JSON.stringify(finalProfile));
      setMessage('Profile saved successfully!');
    } catch (error) {
      setMessage('Error saving profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedProfile = localStorage.getItem('educatorProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Professional Educator Profile</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg border p-8 space-y-6"
      >
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        {/* Grade Level */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Grade Level Taught <span className="text-red-500">*</span>
          </label>
          <select
            name="gradeLevel"
            value={profile.gradeLevel}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">Select a grade level</option>
            {gradeLevelOptions.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Subject Taught <span className="text-red-500">*</span>
          </label>
          <select
            name="subject"
            value={profile.subject}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">Select a subject</option>
            {subjectOptions.map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>

          {profile.subject === 'Other' && (
            <input
              type="text"
              name="customSubject"
              value={profile.customSubject}
              onChange={handleInputChange}
              placeholder="Enter your subject"
              required
              className="mt-3 w-full px-4 py-2 border rounded-lg"
            />
          )}
        </div>

        {/* ✅ Primary Goal */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Primary Goal <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="primaryGoal"
            value={profile.primaryGoal}
            onChange={handleInputChange}
            placeholder='e.g. "Learn Agentic AI theoretical"'
            required
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>



        {/* Available Time & Budget */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Available Time per Week
            </label>
            <select
              name="availableTime"
              value={profile.availableTime}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">Select time commitment</option>
              <option value="1-2 hours">1-2 hours</option>
              <option value="3-5 hours">3-5 hours</option>
              <option value="6-10 hours">6-10 hours</option>
              <option value="10+ hours">10+ hours</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Budget Range
            </label>
            <select
              name="budget"
              value={profile.budget}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">Select budget</option>
              <option value="Free only">Free only</option>
              <option value="₹80-4,000">₹80-4,000</option>
              <option value="₹4,000-16,000">₹4,000-16,000</option>
              <option value="₹16,000+">₹16,000+</option>
            </select>
          </div>
        </div>

        {/* Experience */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Experience Level
          </label>
          <select
            name="experienceLevel"
            value={profile.experienceLevel}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="beginner">Beginner (0-2 years)</option>
            <option value="intermediate">Intermediate (3-7 years)</option>
            <option value="experienced">Experienced (8-15 years)</option>
            <option value="expert">Expert (15+ years)</option>
          </select>
        </div>

        {/* Preferred Formats */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Preferred Learning Formats
          </label>
          <div className="grid md:grid-cols-2 gap-3">
            {formatOptions.map((format) => (
              <label key={format} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={profile.preferredFormat.includes(format)}
                  onChange={() =>
                    handleMultiSelectChange('preferredFormat', format)
                  }
                />
                <span>{format}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-between items-center">
          {message && (
            <p
              className={`text-sm ${
                message.includes('Error') ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg"
          >
            {isLoading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
