import React, { useState } from 'react';

const ResourceCard = ({ resource }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'workshop':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
          </svg>
        );
      case 'tool':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
          </svg>
        );
      case 'article':
      case 'guide':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 21c0 .5.4 1 1 1h4c.6 0 1-.5 1-1v-1H9v1zm3-19C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V17c0 .5.4 1 1 1h6c.6 0 1-.5 1-1v-2.3c1.8-1.3 3-3.4 3-5.7 0-3.9-3.1-7-7-7z"/>
          </svg>
        );
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'workshop':
        return 'bg-gradient-to-r from-blue-400/20 to-blue-600/20 text-blue-800 border border-blue-300/30';
      case 'tool':
        return 'bg-gradient-to-r from-green-400/20 to-green-600/20 text-green-800 border border-green-300/30';
      case 'article':
      case 'guide':
        return 'bg-gradient-to-r from-purple-400/20 to-purple-600/20 text-purple-800 border border-purple-300/30';
      default:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-600/20 text-gray-800 border border-gray-300/30';
    }
  };

  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'bg-gradient-to-r from-green-400/20 to-green-600/20 text-green-800 border border-green-300/30';
      case 'intermediate':
        return 'bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 text-yellow-800 border border-yellow-300/30';
      case 'advanced':
        return 'bg-gradient-to-r from-red-400/20 to-red-600/20 text-red-800 border border-red-300/30';
      default:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-600/20 text-gray-800 border border-gray-300/30';
    }
  };

  const formatCost = (cost) => {
    if (cost === 0 || cost === '0' || cost === 'free') {
      return 'Free';
    }
    if (typeof cost === 'number') {
      return `₹${cost}`;
    }
    // Convert common dollar ranges to rupees
    if (typeof cost === 'string') {
      if (cost.includes('$1-50')) return '₹80-4,000';
      if (cost.includes('$51-200')) return '₹4,000-16,000';
      if (cost.includes('$200+')) return '₹16,000+';
      if (cost.includes('$')) {
        // Replace any remaining dollar signs with rupee symbol
        return cost.replace(/\$/g, '₹');
      }
    }
    return cost || 'N/A';
  };

  return (
    <div 
      className={`glass-card group cursor-pointer transition-all duration-500 transform hover:scale-105 hover:shadow-2xl ${
        isHovered ? 'shadow-2xl shadow-primary-500/30' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-400/10 via-secondary-400/10 to-purple-400/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl text-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 animate-pulse-glow ${getTypeColor(resource.type)}`}>
              {getTypeIcon(resource.type)}
            </div>
            <div>
              <h3 className="font-bold text-xl gradient-text leading-tight group-hover:scale-105 transition-transform duration-300">
                {resource.title}
              </h3>
              <div className="flex items-center space-x-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold glass-card ${getTypeColor(resource.type)}`}>
                  {resource.type}
                </span>
                {resource.level && (
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold glass-card ${getLevelColor(resource.level)}`}>
                    {resource.level}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold gradient-text">
              {formatCost(resource.cost)}
            </div>
            {resource.duration && (
              <div className="text-sm text-gray-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.7L16.2,16.2Z"/>
                </svg>
                {resource.duration}
              </div>
            )}
          </div>
        </div>
        {/* Description */}
        <p className="text-gray-700 text-base mb-6 leading-relaxed line-clamp-3 group-hover:text-gray-800 transition-colors duration-300">
          {resource.description}
        </p>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {resource.tags.slice(0, 4).map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 glass-card bg-gradient-to-r from-gray-400/10 to-gray-600/10 text-gray-700 text-sm rounded-full border border-gray-300/30 hover:scale-105 transition-transform duration-200"
              >
                #{tag}
              </span>
            ))}
            {resource.tags.length > 4 && (
              <span className="px-3 py-1 glass-card bg-gradient-to-r from-primary-400/10 to-primary-600/10 text-primary-700 text-sm rounded-full border border-primary-300/30">
                +{resource.tags.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Subjects and Grade Levels */}
        <div className="space-y-3 mb-6">
          {resource.subjects && resource.subjects.length > 0 && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 font-semibold flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
                Subjects:
              </span>
              <span className="text-sm text-gray-700 font-medium">
                {resource.subjects.slice(0, 3).join(', ')}
                {resource.subjects.length > 3 && ` +${resource.subjects.length - 3} more`}
              </span>
            </div>
          )}
          {resource.grade_levels && resource.grade_levels.length > 0 && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 font-semibold flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Grades:
              </span>
              <span className="text-sm text-gray-700 font-medium">
                {resource.grade_levels.slice(0, 2).join(', ')}
                {resource.grade_levels.length > 2 && ` +${resource.grade_levels.length - 2} more`}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/20">
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-2 rounded-full text-sm font-semibold glass-card transition-all duration-300 ${
              resource.format === 'online' 
                ? 'bg-gradient-to-r from-blue-400/20 to-blue-600/20 text-blue-800 border border-blue-300/30' 
                : 'bg-gradient-to-r from-orange-400/20 to-orange-600/20 text-orange-800 border border-orange-300/30'
            }`}>
              {resource.format === 'online' ? (
                <>
                  <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                  Online
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10z"/>
                  </svg>
                  In-Person
                </>
              )}
            </span>
          </div>
          
          
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;