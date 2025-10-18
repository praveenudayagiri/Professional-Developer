import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import ResourceCard from "../components/ResourceCard";
import AutoResourceCurator from "../components/AutoResourceCurator";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [aiSummary, setAiSummary] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();

  // Gemini setup
  
const genAI = new GoogleGenerativeAI("AIzaSyCDH7EiiwvlrDTX7h19AO1TZ0bxOvHFd4A", {
  apiVersion: "v1" // ✅ force correct version instead of v1beta
});
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro"
});

  // Load profile from localStorage
  const loadProfile = () => {
    const savedProfile = localStorage.getItem("educatorProfile");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else {
      setProfile(null);
    }
  };

  // Reload profile every time route changes
  useEffect(() => {
    loadProfile();
  }, [location]);

  // Reload profile if localStorage changes (cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "educatorProfile") {
        loadProfile();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Call Gemini AI
  const getRecommendations = async () => {
    if (!profile) {
      setError("Please complete your profile first.");
      return;
    }

    setIsLoading(true);
    setError("");
    setAiSummary(null);

    try {
      const finalSubject =
        profile.subject === "Other" ? profile.customSubject : profile.subject;

      const prompt = `
      You are an AI coach for teachers. Here is the teacher profile:
      - Name: ${profile.name}
      - Grade Level: ${profile.gradeLevel}
      - Subject: ${finalSubject}
      - Primary Goal: ${profile.primaryGoal}
      - Teaching Goals: ${profile.teachingGoals}
      - Available Time per Week: ${profile.availableTime}
      - Budget: ${profile.budget}
      - Experience Level: ${profile.experienceLevel}
      - Preferred Formats: ${profile.preferredFormat.join(", ")}

      Please generate 5–7 practical, clear steps or tips for this teacher to effectively achieve their **Primary Goal**. 
      Keep the response motivating and structured in a list.
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      setAiSummary(text);
    } catch (err) {
      console.error("Error calling Gemini AI:", err);
      setError("Failed to get AI recommendations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Profile summary
  const ProfileSummary = () => (
    <div className="card mb-6 p-6 border rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Your Profile</h2>
        <Link to="/profile" className="text-blue-600">
          Edit Profile
        </Link>
      </div>

      {profile ? (
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p>
              <span className="font-medium">Name:</span> {profile.name}
            </p>
            <p>
              <span className="font-medium">Grade Level:</span>{" "}
              {profile.gradeLevel}
            </p>
            <p>
              <span className="font-medium">Subject:</span>{" "}
              {profile.subject === "Other"
                ? profile.customSubject
                : profile.subject}
            </p>
            <p>
              <span className="font-medium">Primary Goal:</span>{" "}
              {profile.primaryGoal || "Not set"}
            </p>
          </div>
          <div>
            <p>
              <span className="font-medium">Available Time:</span>{" "}
              {profile.availableTime}
            </p>
            <p>
              <span className="font-medium">Budget:</span> {profile.budget}
            </p>
            <p>
              <span className="font-medium">Experience:</span>{" "}
              {profile.experienceLevel}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <h3 className="text-lg font-medium mb-2">No Profile Found</h3>
          <p className="text-gray-600 mb-4">
            Create your educator profile to get recommendations.
          </p>
          <Link
            to="/profile"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Create Profile
          </Link>
        </div>
      )}
    </div>
  );

  // Gemini Recommendations
  const RecommendationSection = () => {
    if (!aiSummary) return null;

    return (
      <div className="card p-6 border rounded-lg shadow bg-blue-50">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          AI Coach Tips for You
        </h3>
        <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-line">
          {aiSummary}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

      {/* Profile */}
      <ProfileSummary />

      
      <AutoResourceCurator userProfile={profile} isActive={!!profile} />

      {/* Get Recommendations */}
      <div className="my-6">
        <button
          onClick={getRecommendations}
          disabled={!profile || isLoading}
          className="px-6 py-2 bg-green-600 text-white rounded"
        >
          {isLoading ? "Getting AI Tips..." : "Get AI Tips"}
        </button>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>

      {/* Recommendations */}
      <RecommendationSection />
    </div>
  );
};

export default Dashboard;
