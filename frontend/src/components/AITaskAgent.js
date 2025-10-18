import React, { useState, useEffect } from 'react';

const AITaskAgent = ({ userProfile }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [agentStatus, setAgentStatus] = useState('idle');
  const [completedTasks, setCompletedTasks] = useState([]);

  // Simulate AI analysis and task generation
  const analyzeProfileAndGenerateTasks = async () => {
    setIsAnalyzing(true);
    setAgentStatus('analyzing');
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate personalized tasks based on user profile
    const generatedTasks = [
      {
        id: 1,
        title: "Find 3 classroom management workshops",
        description: "Based on your profile, I'll search for classroom management resources suitable for your grade level",
        priority: "high",
        estimatedTime: "2 minutes",
        status: "pending",
        type: "resource_search"
      },
      {
        id: 2,
        title: "Schedule weekly reflection sessions",
        description: "I'll automatically add 30-minute reflection blocks to your calendar every Friday",
        priority: "medium",
        estimatedTime: "1 minute",
        status: "pending",
        type: "calendar_management"
      },
      {
        id: 3,
        title: "Create personalized learning path",
        description: "I'll design a 6-month professional development roadmap based on your goals",
        priority: "high",
        estimatedTime: "3 minutes",
        status: "pending",
        type: "planning"
      },
      {
        id: 4,
        title: "Set up progress tracking",
        description: "I'll monitor your development activities and send weekly progress reports",
        priority: "medium",
        estimatedTime: "1 minute",
        status: "pending",
        type: "monitoring"
      }
    ];
    
    setTasks(generatedTasks);
    setIsAnalyzing(false);
    setAgentStatus('ready');
  };

  // Execute a task autonomously
  const executeTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Update task status to executing
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: 'executing' } : t
    ));
    setAgentStatus('working');

    // Simulate task execution
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mark task as completed
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setCompletedTasks(prev => [...prev, { ...task, status: 'completed', completedAt: new Date() }]);
    setAgentStatus('ready');
  };

  // Auto-execute all tasks
  const executeAllTasks = async () => {
    setAgentStatus('working');
    for (const task of tasks) {
      await executeTask(task.id);
    }
    setAgentStatus('idle');
  };

  useEffect(() => {
    if (userProfile && tasks.length === 0) {
      analyzeProfileAndGenerateTasks();
    }
  }, [userProfile]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'analyzing': return 'text-blue-600';
      case 'ready': return 'text-green-600';
      case 'working': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'analyzing':
        return (
          <svg className="w-5 h-5 animate-spin" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2v4m0 12v4m10-10h-4M6 12H2m15.364-7.364l-2.828 2.828M9.464 9.464L6.636 6.636m12.728 12.728l-2.828-2.828M9.464 14.536l-2.828 2.828"/>
          </svg>
        );
      case 'ready':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        );
      case 'working':
        return (
          <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        );
    }
  };

  return (
    <div className="glass-card p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold gradient-text">AI Task Agent</h2>
            <div className={`flex items-center space-x-2 ${getStatusColor(agentStatus)}`}>
              {getStatusIcon(agentStatus)}
              <span className="text-sm font-medium capitalize">{agentStatus}</span>
            </div>
          </div>
        </div>
        
        {tasks.length > 0 && agentStatus === 'ready' && (
          <button
            onClick={executeAllTasks}
            className="btn-primary flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <span>Execute All Tasks</span>
          </button>
        )}
      </div>

      {isAnalyzing && (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your profile and generating personalized tasks...</p>
        </div>
      )}

      {tasks.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Pending Tasks</h3>
          {tasks.map(task => (
            <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      task.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {task.priority}
                    </span>
                    <span className="text-xs text-gray-500">{task.estimatedTime}</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{task.title}</h4>
                  <p className="text-sm text-gray-600">{task.description}</p>
                </div>
                <button
                  onClick={() => executeTask(task.id)}
                  disabled={task.status === 'executing'}
                  className="ml-4 px-3 py-1 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {task.status === 'executing' ? 'Executing...' : 'Execute'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {completedTasks.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="font-semibold text-lg text-green-600">Completed Tasks</h3>
          {completedTasks.map(task => (
            <div key={task.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span className="text-sm text-green-600 font-medium">
                  Completed at {task.completedAt.toLocaleTimeString()}
                </span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">{task.title}</h4>
              <p className="text-sm text-gray-600">{task.description}</p>
            </div>
          ))}
        </div>
      )}

      {tasks.length === 0 && !isAnalyzing && completedTasks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <p>No tasks available. Complete your profile to get personalized AI assistance.</p>
        </div>
      )}
    </div>
  );
};

export default AITaskAgent;