import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="max-w-6xl mx-auto relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-400/20 to-secondary-400/20 rounded-full blur-3xl animate-floating"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-floating" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-green-400/10 rounded-full blur-3xl animate-pulse-glow"></div>
      </div>

      {/* Hero Section */}
      <div className={`text-center py-20 relative z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="glass-card p-12 mb-8 backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
          <h1 className="text-6xl md:text-7xl font-bold gradient-text mb-8 animate-slide-up">
            AI Professional Development Coach
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-10 max-w-4xl mx-auto leading-relaxed animate-fade-in" style={{animationDelay: '0.3s'}}>
            Get personalized professional development recommendations tailored to your teaching goals, 
            subjects, and constraints. Powered by AI to help you grow as an educator.
          </p>
          <div className="animate-fade-in" style={{animationDelay: '0.6s'}}>
            <Link
              to="/dashboard"
              className="btn-primary text-xl px-12 py-4 inline-block transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-primary-500/50"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className={`grid md:grid-cols-3 gap-8 py-20 relative z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`} style={{animationDelay: '0.9s'}}>
        <div className="glass-card text-center group hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-primary-500/30">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-primary-500/50 transition-all duration-300 animate-pulse-glow">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold gradient-text mb-4">Personalized Recommendations</h3>
          <p className="text-gray-700 leading-relaxed">
            Get tailored professional development suggestions based on your teaching profile, goals, and available time.
          </p>
        </div>

        <div className="glass-card text-center group hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-secondary-500/30" style={{animationDelay: '0.2s'}}>
          <div className="w-20 h-20 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-secondary-500/50 transition-all duration-300 animate-pulse-glow">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold gradient-text mb-4">Curated Resources</h3>
          <p className="text-gray-700 leading-relaxed">
            Access a comprehensive library of workshops, tools, articles, and guides specifically chosen for educators.
          </p>
        </div>

        <div className="glass-card text-center group hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/30" style={{animationDelay: '0.4s'}}>
          <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300 animate-pulse-glow">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold gradient-text mb-4">Actionable Steps</h3>
          <p className="text-gray-700 leading-relaxed">
            Receive specific, actionable next steps to implement your professional development plan effectively.
          </p>
        </div>
      </div>

      {/* How It Works Section */}
      <div className={`py-20 relative z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`} style={{animationDelay: '1.2s'}}>
        <div className="glass-card p-12 backdrop-blur-xl bg-gradient-to-r from-white/10 to-white/5 border border-white/20 shadow-2xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center gradient-text mb-16">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg group-hover:shadow-primary-500/50 transition-all duration-300 transform group-hover:scale-110 animate-pulse-glow">
                1
              </div>
              <h4 className="font-bold text-xl gradient-text mb-3">Create Profile</h4>
              <p className="text-gray-700 leading-relaxed">
                Tell us about your teaching subjects, grade levels, and professional goals.
              </p>
            </div>
            <div className="text-center group" style={{animationDelay: '0.2s'}}>
              <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-secondary-700 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg group-hover:shadow-secondary-500/50 transition-all duration-300 transform group-hover:scale-110 animate-pulse-glow">
                2
              </div>
              <h4 className="font-bold text-xl gradient-text mb-3">AI Analysis</h4>
              <p className="text-gray-700 leading-relaxed">
                Our AI analyzes your profile and matches you with relevant resources.
              </p>
            </div>
            <div className="text-center group" style={{animationDelay: '0.4s'}}>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300 transform group-hover:scale-110 animate-pulse-glow">
                3
              </div>
              <h4 className="font-bold text-xl gradient-text mb-3">Get Recommendations</h4>
              <p className="text-gray-700 leading-relaxed">
                Receive personalized coaching advice and curated resource recommendations.
              </p>
            </div>
            <div className="text-center group" style={{animationDelay: '0.6s'}}>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg group-hover:shadow-green-500/50 transition-all duration-300 transform group-hover:scale-110 animate-pulse-glow">
                4
              </div>
              <h4 className="font-bold text-xl gradient-text mb-3">Take Action</h4>
              <p className="text-gray-700 leading-relaxed">
                Follow the actionable steps to implement your professional development plan.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className={`text-center py-20 relative z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`} style={{animationDelay: '1.5s'}}>
        <div className="glass-card p-12 backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 shadow-2xl">
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
            Ready to Enhance Your Teaching?
          </h2>
          <p className="text-xl md:text-2xl text-gray-700 mb-10 leading-relaxed">
            Join thousands of educators who are already using AI to accelerate their professional growth.
          </p>
          <Link
              to="/dashboard"
              className="btn-primary text-xl px-12 py-4 inline-block transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-primary-500/50"
            >
              Start Your Journey
            </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;