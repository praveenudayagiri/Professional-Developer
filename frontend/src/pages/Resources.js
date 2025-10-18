import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ResourceCard from '../components/ResourceCard';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    level: '',
    subject: '',
    format: '',
    cost: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [resources, filters, searchTerm]);

  const fetchResources = async () => {
    try {
      const response = await axios.get('http://localhost:8000/resources');
      setResources(response.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
      setError('Failed to load resources. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = resources;

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (resource.tags && resource.tags.some(tag => 
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }

    // Apply type filter
    if (filters.type) {
      filtered = filtered.filter(resource => 
        resource.type.toLowerCase() === filters.type.toLowerCase()
      );
    }

    // Apply level filter
    if (filters.level) {
      filtered = filtered.filter(resource => 
        resource.level && resource.level.toLowerCase() === filters.level.toLowerCase()
      );
    }

    // Apply subject filter
    if (filters.subject) {
      filtered = filtered.filter(resource => 
        resource.subjects && resource.subjects.some(subject =>
          subject.toLowerCase().includes(filters.subject.toLowerCase())
        )
      );
    }

    // Apply format filter
    if (filters.format) {
      filtered = filtered.filter(resource => 
        resource.format && resource.format.toLowerCase() === filters.format.toLowerCase()
      );
    }

    // Apply cost filter
    if (filters.cost) {
      if (filters.cost === 'free') {
        filtered = filtered.filter(resource => 
          resource.cost === 0 || resource.cost === '0' || resource.cost === 'free'
        );
      } else if (filters.cost === 'paid') {
        filtered = filtered.filter(resource => 
          resource.cost && resource.cost !== 0 && resource.cost !== '0' && resource.cost !== 'free'
        );
      }
    }

    setFilteredResources(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      level: '',
      subject: '',
      format: '',
      cost: ''
    });
    setSearchTerm('');
  };

  const getUniqueValues = (field) => {
    const values = new Set();
    resources.forEach(resource => {
      if (field === 'subjects' && resource.subjects) {
        resource.subjects.forEach(subject => values.add(subject));
      } else if (resource[field]) {
        values.add(resource[field]);
      }
    });
    return Array.from(values).sort();
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <svg className="animate-spin w-8 h-8 text-primary-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600">Loading resources...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="card text-center py-16">
          <svg className="w-16 h-16 text-red-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Resources</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={fetchResources} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Professional Development Resources</h1>
        <p className="text-gray-600">
          Explore our curated collection of workshops, tools, articles, and guides for educators.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="card mb-8">
        <div className="space-y-4">
          {/* Search Bar */}
          <div>
            <label className="label">Search Resources</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
                placeholder="Search by title, description, or tags..."
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="label">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="input"
              >
                <option value="">All Types</option>
                {getUniqueValues('type').map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Level</label>
              <select
                value={filters.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
                className="input"
              >
                <option value="">All Levels</option>
                {getUniqueValues('level').map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Subject</label>
              <select
                value={filters.subject}
                onChange={(e) => handleFilterChange('subject', e.target.value)}
                className="input"
              >
                <option value="">All Subjects</option>
                {getUniqueValues('subjects').map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Format</label>
              <select
                value={filters.format}
                onChange={(e) => handleFilterChange('format', e.target.value)}
                className="input"
              >
                <option value="">All Formats</option>
                {getUniqueValues('format').map(format => (
                  <option key={format} value={format}>{format}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Cost</label>
              <select
                value={filters.cost}
                onChange={(e) => handleFilterChange('cost', e.target.value)}
                className="input"
              >
                <option value="">All</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="flex items-center justify-between">
            <button
              onClick={clearFilters}
              className="btn-secondary text-sm"
            >
              Clear All Filters
            </button>
            <span className="text-sm text-gray-600">
              Showing {filteredResources.length} of {resources.length} resources
            </span>
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      {filteredResources.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource, index) => (
            <ResourceCard key={resource._id || index} resource={resource} />
          ))}
        </div>
      ) : (
        <div className="card text-center py-16">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Resources Found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || Object.values(filters).some(f => f) 
              ? "No resources match your current search and filter criteria. Try adjusting your filters."
              : "No resources are currently available. Check back later."
            }
          </p>
          {(searchTerm || Object.values(filters).some(f => f)) && (
            <button onClick={clearFilters} className="btn-primary">
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Resources;