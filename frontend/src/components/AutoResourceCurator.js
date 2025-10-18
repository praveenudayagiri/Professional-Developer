import React, { useState, useEffect } from 'react';
import ResourceCard from './ResourceCard';

const AutoResourceCurator = ({ userProfile, isActive = true }) => {
  const [curatedResources, setCuratedResources] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [autoMode, setAutoMode] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Helpers
  const getProfileSubject = () => {
    if (!userProfile) return 'Education';
    if (userProfile.subject === 'Other') {
      return userProfile.customSubject || 'Custom Subject';
    }
    return userProfile.subject || 'Education';
  };

  const getProfileGradeLevel = () => {
    if (!userProfile) return 'K-12';
    return userProfile.gradeLevel || 'K-12';
  };

  const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const randomInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  // Fake data pools
  const providers = [
    'Coursera',
    'edX',
    'Khan Academy',
    'MIT OpenCourseWare',
    'Harvard Online',
    'FutureLearn',
    'Edutopia',
    'TeachThought',
    'ClassCentral',
    'Stanford Online'
  ];

  const types = ['workshop', 'guide', 'webinar', 'tool', 'course', 'article', 'research paper', 'podcast'];
  const formats = ['online', 'in-person', 'self-paced', 'hybrid'];
  const tags = [
    'engagement',
    'assessment',
    'AI',
    'classroom-management',
    'inclusion',
    'edtech',
    'project-based learning',
    'differentiation',
    'STEM',
    'creativity',
    'digital literacy',
    'pedagogy'
  ];

    const templates = [
    {
      title: (s, g) => `Innovative ${s} Teaching Practices`,
      description: (s, g) =>
        `Explore cutting-edge techniques to make ${s} more engaging for ${g}. Includes classroom examples and practical activities.`,
    },
    {
      title: (s, g) => `${s} Masterclass for ${g}`,
      description: (s, g) =>
        `Comprehensive program designed for ${g} teachers to deepen their ${s} expertise and improve outcomes.`,
    },
    {
      title: (s, g) => `Technology Integration in ${s}`,
      description: (s, g) =>
        `Learn how to integrate AI tools and apps into your ${s} classes to enhance participation and results.`,
    },
    {
      title: (s, g) => `Effective Assessment in ${s}`,
      description: (s, g) =>
        `Discover innovative assessment strategies for ${g} classrooms, from digital rubrics to peer evaluation.`,
    },
    {
      title: (s, g) => `${s} Research & Evidence-Based Strategies`,
      description: (s, g) =>
        `A curated collection of recent studies highlighting effective approaches to teaching ${s} in ${g} settings.`,
    },
    {
      title: (s, g) => `${s} Lesson Planning Toolkit`,
      description: (s, g) =>
        `Download ready-to-use templates, planners, and examples for effective ${s} lessons tailored to ${g}.`,
    },
    {
      title: (s, g) => `Gamification in ${s}`,
      description: (s, g) =>
        `Practical guide to turning ${s} activities into fun, gamified experiences to keep ${g} learners motivated.`,
    },
    {
      title: (s, g) => `Inclusive Practices in ${s}`,
      description: (s, g) =>
        `Learn how to design ${s} lessons that are inclusive for all learning needs, with real classroom case studies.`,
    },
    {
      title: (s, g) => `${s} for the Future Workplace`,
      description: (s, g) =>
        `See how ${s} connects with future careers. Includes insights from industry experts and practical classroom projects.`,
    },
    // 🔥 New 20+
    {
      title: (s, g) => `Project-Based Learning in ${s}`,
      description: (s, g) =>
        `Engage ${g} learners through real-world projects that connect ${s} with authentic problem-solving.`,
    },
    {
      title: (s, g) => `Flipped Classroom in ${s}`,
      description: (s, g) =>
        `Discover how flipping your ${s} lessons can maximize active learning and free class time for deeper activities.`,
    },
    {
      title: (s, g) => `Differentiation in ${s}`,
      description: (s, g) =>
        `Strategies to differentiate ${s} instruction for diverse ${g} learners, including gifted and struggling students.`,
    },
    {
      title: (s, g) => `Leadership Skills for ${s} Educators`,
      description: (s, g) =>
        `Develop leadership and mentoring abilities to guide colleagues and improve ${s} instruction school-wide.`,
    },
    {
      title: (s, g) => `AI in ${s} Education`,
      description: (s, g) =>
        `How artificial intelligence is transforming ${s} instruction. Practical classroom AI tools explained.`,
    },
    {
      title: (s, g) => `SEL (Social Emotional Learning) in ${s}`,
      description: (s, g) =>
        `Integrating SEL frameworks into ${s} to improve ${g} learners’ well-being and academic resilience.`,
    },
    {
      title: (s, g) => `${s} and STEM Integration`,
      description: (s, g) =>
        `Cross-disciplinary methods to connect ${s} with STEM and inspire curiosity among ${g} learners.`,
    },
    {
      title: (s, g) => `${s} Literacy in the Digital Age`,
      description: (s, g) =>
        `Teach ${g} students to critically engage with digital tools while mastering ${s}.`,
    },
    {
      title: (s, g) => `Open Educational Resources for ${s}`,
      description: (s, g) =>
        `A curated guide to free, open-access resources for teaching ${s} effectively.`,
    },
    {
      title: (s, g) => `Collaborative Learning in ${s}`,
      description: (s, g) =>
        `Build peer-to-peer learning communities around ${s}, improving teamwork and communication skills.`,
    },
    {
      title: (s, g) => `Mindfulness in ${s} Classrooms`,
      description: (s, g) =>
        `Introduce mindfulness routines to improve focus and reduce stress in ${s} learning environments.`,
    },
    {
      title: (s, g) => `${s} Curriculum Redesign`,
      description: (s, g) =>
        `Step-by-step guide to redesigning your ${s} curriculum to align with 21st-century skills.`,
    },
    {
      title: (s, g) => `${s} Education Policy Updates`,
      description: (s, g) =>
        `Understand how recent education policy changes affect ${s} teaching and assessment in ${g}.`,
    },
    {
      title: (s, g) => `${s} for Special Needs Education`,
      description: (s, g) =>
        `Strategies, assistive technologies, and accommodations for inclusive ${s} classrooms.`,
    },
    {
      title: (s, g) => `Cross-Cultural Perspectives in ${s}`,
      description: (s, g) =>
        `Explore how cultural diversity shapes the teaching and learning of ${s} in ${g}.`,
    },
    {
      title: (s, g) => `${s} Teacher Wellness & Burnout Prevention`,
      description: (s, g) =>
        `Practical methods for ${s} educators to manage workload, reduce burnout, and maintain well-being.`,
    },
    {
      title: (s, g) => `${s} and Creativity`,
      description: (s, g) =>
        `Incorporate creative problem-solving, arts, and innovation into your ${s} lessons.`,
    },
    {
      title: (s, g) => `Global Trends in ${s} Education`,
      description: (s, g) =>
        `Stay updated on international best practices and new teaching methodologies in ${s}.`,
    },
    {
      title: (s, g) => `${s} Data-Driven Instruction`,
      description: (s, g) =>
        `Leverage learning analytics and data tools to personalize ${s} lessons for ${g} learners.`,
    },
        {
      title: (s, g) => `Harvard Webinar: Future of ${s} Education`,
      description: (s, g) =>
        `Hear from global experts on how ${s} is evolving for ${g}, with insights from Harvard faculty.`,
    },
    {
      title: (s, g) => `Oxford Research Review in ${s}`,
      description: (s, g) =>
        `A digest of the latest academic papers on ${s}, tailored for ${g} teachers and practitioners.`,
    },
    {
      title: (s, g) => `MIT AI Lab: ${s} + Artificial Intelligence`,
      description: (s, g) =>
        `Explore MIT’s pioneering research on AI-driven teaching methods for ${s} in ${g} classrooms.`,
    },
    {
      title: (s, g) => `National Standards Update for ${s}`,
      description: (s, g) =>
        `Understand the newest government standards and benchmarks in ${s} education for ${g}.`,
    },
    {
      title: (s, g) => `Teacher Stories: ${s} in Practice`,
      description: (s, g) =>
        `Real-world experiences from ${g} teachers on what works (and doesn’t) in ${s}.`,
    },
    {
      title: (s, g) => `Gamified Apps for ${s}`,
      description: (s, g) =>
        `Top 10 interactive apps to gamify ${s} lessons, keeping ${g} learners motivated.`,
    },
    {
      title: (s, g) => `Climate Change & ${s}`,
      description: (s, g) =>
        `Design projects that connect ${s} with climate literacy, making ${g} learning relevant and urgent.`,
    },
    {
      title: (s, g) => `Equity & Access in ${s}`,
      description: (s, g) =>
        `Strategies to ensure all ${g} students have fair access to ${s} learning opportunities.`,
    },
    {
      title: (s, g) => `Blended Learning Models for ${s}`,
      description: (s, g) =>
        `Explore hybrid models that combine in-person and online teaching for ${s} in ${g} contexts.`,
    },
    {
      title: (s, g) => `UNESCO Report on ${s} Education`,
      description: (s, g) =>
        `Highlights from UNESCO’s annual report on global ${s} trends and their relevance to ${g} classrooms.`,
    },
    {
      title: (s, g) => `Future Careers Linked to ${s}`,
      description: (s, g) =>
        `See which jobs and industries depend on strong ${s} foundations — help ${g} students connect learning to life.`,
    },
    {
      title: (s, g) => `Parent Engagement in ${s}`,
      description: (s, g) =>
        `How to involve families in supporting ${s} learning outside the classroom for ${g} students.`,
    },
    {
      title: (s, g) => `Khan Academy Insights: ${s}`,
      description: (s, g) =>
        `Best practices from Khan Academy’s ${s} modules, including adaptive practice and self-paced support.`,
    },
    {
      title: (s, g) => `Ethics in Teaching ${s}`,
      description: (s, g) =>
        `Case studies exploring ethical dilemmas in ${s} teaching and how to navigate them responsibly.`,
    },
    {
      title: (s, g) => `Design Thinking in ${s}`,
      description: (s, g) =>
        `Apply design thinking methods to innovate your ${s} lessons and engage ${g} students in problem-solving.`,
    },
    {
      title: (s, g) => `Assessment Without Grades in ${s}`,
      description: (s, g) =>
        `Alternatives to traditional grading in ${s}, focusing on mastery, feedback, and student growth.`,
    },
    {
      title: (s, g) => `Digital Safety & ${s}`,
      description: (s, g) =>
        `Ensure ${g} learners stay safe while engaging in online ${s} activities and digital platforms.`,
    },
    {
      title: (s, g) => `Community-Based ${s} Projects`,
      description: (s, g) =>
        `Connect ${s} learning to local community issues — project guides that give ${g} students real-world impact.`,
    },
    {
      title: (s, g) => `Podcast: Global Voices in ${s}`,
      description: (s, g) =>
        `Listen to teachers worldwide share unique approaches to teaching ${s} in ${g}.`,
    },
    {
      title: (s, g) => `AI Tutors for ${s}`,
      description: (s, g) =>
        `Overview of AI-powered tutoring systems that support personalized ${s} instruction for ${g} learners.`,
    }

  ];


  // Generator
  const generateFakeResource = (subject, gradeLevel) => {
    const chosen = randomChoice(templates);

    return {
      id: `auto-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: chosen.title(subject, gradeLevel),
      description: chosen.description(subject, gradeLevel),
      type: randomChoice(types),
      level: userProfile.experienceLevel || 'intermediate',
      cost: userProfile.budget === 'Free only' ? 0 : randomInt(500, 12000),
      duration: `${randomInt(30, 240)} minutes`,
      format: randomChoice(formats),
      subjects: [subject],
      grade_levels: [gradeLevel],
      tags: Array.from({ length: 3 }, () => randomChoice(tags)),
      link: `https://www.${randomChoice(providers).replace(/\s+/g, '').toLowerCase()}.org/`,
      discoveredAt: new Date(),
      relevanceScore: randomInt(75, 99),
      provider: randomChoice(providers)
    };
  };

  const discoverResources = async () => {
    if (!userProfile || !isActive) return;

    setIsSearching(true);
    await new Promise((resolve) => setTimeout(resolve, 10000));

    const subject = getProfileSubject();
    const gradeLevel = getProfileGradeLevel();

    // Generate 2–5 resources each time
    const newResources = Array.from(
      { length: randomInt(2, 7) },
      () => generateFakeResource(subject, gradeLevel)
    );

    setCuratedResources((prev) => {
      const combined = [...prev, ...newResources];
      return combined.slice(-15); // keep last 15
    });

    setLastUpdate(new Date());
    setIsSearching(false);
  };

  useEffect(() => {
    if (!autoMode || !userProfile) return;
    discoverResources();
    const interval = setInterval(discoverResources, 10000);
    return () => clearInterval(interval);
  }, [userProfile, autoMode, isActive]);

  return (
    <div className="glass-card p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Auto Resource Curator</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAutoMode(!autoMode)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              autoMode
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {autoMode ? 'Auto ON' : 'Auto OFF'}
          </button>
          <button
            onClick={discoverResources}
            disabled={isSearching}
            className="btn-secondary text-sm"
          >
            {isSearching ? 'Searching...' : 'Search Now'}
          </button>
        </div>
      </div>

      {curatedResources.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {curatedResources
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
        </div>
      ) : !isSearching ? (
        <div className="text-center text-gray-500 py-8">
          <p>No resources discovered yet.</p>
        </div>
      ) : null}
    </div>
  );
};

export default AutoResourceCurator;
