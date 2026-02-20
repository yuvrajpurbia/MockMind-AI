/**
 * Prompt templates for Ollama LLM
 * All prompts enforce strict JSON output and role-domain constraints
 */

/**
 * Role-specific domain definitions.
 * Used to constrain the AI to only ask questions within the role's domain.
 */
const ROLE_DOMAINS = {
  'Frontend Developer': {
    domain: 'frontend web development',
    scope: 'HTML, CSS, JavaScript, React, Angular, Vue, state management, component architecture, browser rendering, responsive design, accessibility, and frontend performance optimization',
    forbidden: 'Do NOT ask about backend architecture, database schema design, server-side scaling, DevOps, or Salesforce.',
    examples: [
      'How does the virtual DOM work in React?',
      'What is the difference between CSS Grid and Flexbox?',
      'Explain how React hooks manage component state.',
    ],
  },
  'Backend Developer': {
    domain: 'backend development and server-side engineering',
    scope: 'Node.js, Express, REST APIs, authentication (JWT, OAuth), SQL and NoSQL databases, caching, microservices, system design, error handling, logging, server security, and backend performance',
    forbidden: 'Do NOT ask about CSS styling, UI/UX design, frontend frameworks, or Salesforce.',
    examples: [
      'What is the difference between SQL and NoSQL databases?',
      'How does JWT authentication work?',
      'Explain the concept of middleware in Express.js.',
    ],
  },
  'Full Stack Developer': {
    domain: 'full-stack web development spanning frontend and backend',
    scope: 'frontend-backend integration, REST/GraphQL APIs, database-UI workflows, end-to-end authentication, deployment, CI/CD, cross-layer performance, state management, real-time communication, and moderate system design',
    forbidden: 'Do NOT ask isolated frontend-only or backend-only trivia. Questions must test cross-layer understanding. Do NOT ask about Salesforce.',
    examples: [
      'How would you design the authentication flow from login form to protected API endpoint?',
      'Explain how you would connect a React frontend to a REST API with proper error handling.',
      'What strategies would you use to optimize performance across both client and server?',
    ],
  },
  'Salesforce Developer': {
    domain: 'Salesforce platform development',
    scope: 'Apex programming, SOQL, SOSL, triggers, Lightning Web Components (LWC), Salesforce architecture, governor limits, Flows, Process Builder, REST/SOAP integration on Salesforce, security and sharing rules, data model, batch Apex, and Visualforce',
    forbidden: 'Do NOT ask about generic React, Node.js, Python, or non-Salesforce system design.',
    examples: [
      'What are governor limits in Salesforce and why do they matter?',
      'Explain the difference between before and after triggers in Apex.',
      'How does the Lightning Web Components event model work?',
    ],
  },
  'Software Engineer': {
    domain: 'core software engineering and computer science fundamentals',
    scope: 'data structures, algorithms, object-oriented design, system design, concurrency, design patterns, code quality, refactoring, version control, testing strategies, complexity analysis, and distributed systems basics',
    forbidden: 'Do NOT ask about specific frameworks (React, Angular), UI design, or Salesforce. Focus on language-agnostic engineering principles.',
    examples: [
      'What is the time complexity of binary search?',
      'Explain the SOLID principles in object-oriented design.',
      'How would you design a URL shortening service?',
    ],
  },
  'Data Scientist': {
    domain: 'data science, machine learning, and statistical analysis',
    scope: 'Python for data science, machine learning algorithms, statistics, deep learning, data analysis, SQL for analytics, TensorFlow, PyTorch, data visualization, feature engineering, model evaluation, big data concepts, and NLP',
    forbidden: 'Do NOT ask about frontend development, CSS, backend APIs, or Salesforce.',
    examples: [
      'What is the difference between supervised and unsupervised learning?',
      'Explain the bias-variance tradeoff.',
      'How would you handle missing values in a dataset?',
    ],
  },
  'Product Manager': {
    domain: 'product management and strategy',
    scope: 'product strategy, roadmap planning, user research, market analysis, agile methodologies, stakeholder management, metrics/KPIs, go-to-market strategy, competitive analysis, product lifecycle, prioritization frameworks, and experimentation',
    forbidden: 'Do NOT ask about coding, technical implementation details, or specific programming languages.',
    examples: [
      'How would you prioritize features for a new product launch?',
      'What metrics would you track to measure product success?',
      'Describe how you would conduct user research for a B2B product.',
    ],
  },
  'Designer': {
    domain: 'UI/UX design and user experience',
    scope: 'UI/UX principles, Figma, design tools, user research methods, wireframing, prototyping, design systems, accessibility standards, visual hierarchy, typography, interaction design, responsive layouts, design thinking, usability testing, and motion design',
    forbidden: 'Do NOT ask about backend architecture, database design, algorithms, or Salesforce.',
    examples: [
      'What is the difference between UX and UI design?',
      'How would you approach designing a mobile-first experience?',
      'Explain the principles of visual hierarchy.',
    ],
  },
};

/** Get role domain or a safe default */
function getRoleDomain(role) {
  return ROLE_DOMAINS[role] || {
    domain: role.toLowerCase(),
    scope: `topics relevant to the ${role} position`,
    forbidden: 'Stay within the scope of the role.',
    examples: ['Ask a relevant, focused question for this role.'],
  };
}

export const prompts = {
  /**
   * Generate the initial interview question
   */
  generateInitialQuestion: ({ role, level, topics }) => {
    const rd = getRoleDomain(role);

    return `You are an expert interviewer conducting a ${level} level interview for a ${role} position.
Your domain: ${rd.domain}.

Context:
- Role: ${role}
- Experience Level: ${level}
- Focus Topics: ${topics.join(', ')}
- Allowed Scope: ${rd.scope}

STRICT DOMAIN RULES:
- ONLY ask questions about: ${rd.scope}
- ${rd.forbidden}
- Choose your question topic from: ${topics.join(', ')}

QUESTION REQUIREMENTS:
1. Ask a SHORT, FOCUSED question (1-2 sentences max)
2. ONE clear topic only
3. Appropriate difficulty for ${level} level
4. Can be answered in 1-2 minutes
5. No compound questions

EXAMPLES OF GOOD QUESTIONS FOR ${role.toUpperCase()}:
${rd.examples.map((e) => `- "${e}"`).join('\n')}

CRITICAL: You MUST respond with ONLY valid JSON. No other text.

{
  "question": "Your SHORT interview question here (1-2 sentences max)",
  "type": "technical",
  "difficulty": 3,
  "expectedKeyPoints": ["key point 1", "key point 2", "key point 3"]
}`;
  },

  /**
   * Evaluate a candidate's answer
   */
  evaluateAnswer: ({ question, answer, expectedKeyPoints, role }) => {
    const rd = getRoleDomain(role);

    return `You are evaluating an answer in a ${role} interview.
Domain: ${rd.domain}.

Question: "${question}"
Expected: ${expectedKeyPoints.join(', ')}
Answer: "${answer}"

SCORING RULES (IMPORTANT):
1. If answer is WRONG or talks about something else = 0-20
2. If answer is too vague or lacks details = 30-50
3. If answer is partially correct but incomplete = 55-70
4. If answer is mostly correct with good details = 70-85
5. If answer is excellent and comprehensive = 85-100

CHECK: Does the answer actually address the question?
- If NO → score must be 0-25
- If answer is off-topic → score must be 0-15

Evaluate strictly within the ${rd.domain} context. Assess whether the candidate demonstrates real ${role} knowledge.

Return ONLY JSON:
{
  "score": 60,
  "feedback": "Brief honest feedback",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improve1", "improve2"],
  "keyPointsCovered": ["point1"]
}`;
  },

  /**
   * Generate follow-up question based on conversation history
   */
  generateFollowUp: ({ role, level, history, lastScore, topicsCovered, uncoveredTopics }) => {
    const rd = getRoleDomain(role);

    return `You are continuing a ${level} level interview for a ${role} position.
Your domain: ${rd.domain}.

Recent Conversation:
${history}

Last Answer Score: ${lastScore}/100

Topics Already Covered: ${topicsCovered.join(', ')}
${uncoveredTopics.length > 0 ? `Topics Not Yet Covered: ${uncoveredTopics.join(', ')}` : ''}

STRICT DOMAIN RULES:
- ONLY ask questions about: ${rd.scope}
- ${rd.forbidden}
- Stay within the ${role} domain. Do NOT cross into other roles.

Instructions for Next Question:
${lastScore >= 80 ? '- The candidate did well. INCREASE difficulty or go deeper.' : lastScore >= 60 ? '- The candidate showed decent understanding. MAINTAIN current difficulty.' : '- The candidate struggled. Ask a SIMPLER question to assess fundamentals.'}
${uncoveredTopics.length > 0 ? `- Explore one of these uncovered topics: ${uncoveredTopics.slice(0, 2).join(' or ')}` : '- Deepen the current topic with a follow-up.'}

QUESTION REQUIREMENTS:
1. Ask a SHORT, FOCUSED question (1-2 sentences max)
2. ONE clear topic only — from the ${role} domain
3. No compound or multi-part questions
4. Direct and simple phrasing
5. Can be answered in 1-2 minutes

EXAMPLES OF GOOD QUESTIONS FOR ${role.toUpperCase()}:
${rd.examples.map((e) => `- "${e}"`).join('\n')}

CRITICAL: You MUST respond with ONLY valid JSON. No other text.

{
  "question": "Your SHORT follow-up question here (1-2 sentences max)",
  "type": "technical",
  "difficulty": 4,
  "expectedKeyPoints": ["key point 1", "key point 2", "key point 3"]
}`;
  },

  /**
   * Generate comprehensive final report
   */
  generateReport: ({ role, level, qaPairs, duration }) => {
    const rd = getRoleDomain(role);
    const qaHistory = qaPairs.map((qa, i) =>
      `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer}\nScore: ${qa.score}/100\n`
    ).join('\n');

    return `Generate a comprehensive interview performance report for a ${role} candidate.
Domain evaluated: ${rd.domain}.

Interview Details:
- Role: ${role}
- Level: ${level}
- Duration: ${Math.round(duration / 60)} minutes
- Questions Asked: ${qaPairs.length}

Complete Q&A History:
${qaHistory}

Your Task:
Analyze the candidate's performance specifically as a ${role}. Provide:
1. An overall score (0-100) representing interview performance
2. A summary paragraph (3-4 sentences) describing overall performance as a ${role}
3. Category scores for: technical depth, communication clarity, problem-solving approach
4. Top 3 specific strengths demonstrated
5. Top 3 specific areas for improvement
6. 3 actionable recommendations for next steps as a ${role}

Be fair, specific, and constructive. Frame feedback in the context of the ${role} role.

CRITICAL: You MUST respond with ONLY valid JSON. No other text.

{
  "overallScore": 78,
  "summary": "A 3-4 sentence paragraph summarizing the candidate's overall performance as a ${role}.",
  "categoryScores": {
    "technical": 80,
    "communication": 75,
    "problemSolving": 78
  },
  "strengths": [
    "Specific strength with example from interview",
    "Another specific strength with example",
    "Third specific strength with example"
  ],
  "improvements": [
    "Specific area to improve with actionable advice",
    "Another area with concrete suggestion",
    "Third area with clear next step"
  ],
  "recommendations": [
    "Actionable recommendation 1",
    "Actionable recommendation 2",
    "Actionable recommendation 3"
  ]
}`;
  }
};
