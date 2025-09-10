// Smart prompt templates for generating educational content

// Quest generation prompt
export function createQuestPrompt(params) {
    const { 
        category, 
        difficulty, 
        userState, 
        userGrade, 
        language = 'english',
        questCount = 1 
    } = params;
    
    return `
You are an expert environmental education content creator designing quests for Indian students.

Create ${questCount} engaging environmental quest(s) with the following specifications:

**Context:**
- Category: ${category}
- Difficulty: ${difficulty} (beginner/intermediate/advanced)
- Target: Grade ${userGrade} students in ${userState}, India
- Language: ${language}

**Quest Requirements:**
1. Title should be catchy and age-appropriate
2. Include 4 missions: 1 quiz, 1 photo task, 1 written reflection, 1 tracking activity
3. Content must be relevant to ${userState}'s environmental challenges
4. Include local examples, species, or geographic features from ${userState}
5. Align with NCERT environmental science curriculum
6. Specify realistic XP rewards (25-100 XP per mission)

**Output Format (JSON):**
{
  "quests": [
    {
      "id": "auto-generated-id",
      "title": "Quest Title",
      "description": "Detailed description (100-150 words)",
      "category": "${category}",
      "difficulty": "${difficulty}",
      "estimatedTime": "X minutes",
      "xpReward": 200,
      "icon": "relevant-emoji",
      "color": "category-color",
      "regions": ["${userState.toLowerCase()}"],
      "grade": ${userGrade},
      "featured": false,
      "missions": [
        {
          "id": "mission-1",
          "title": "Quiz Mission Title",
          "description": "Quiz description",
          "type": "quiz",
          "xpReward": 30,
          "content": {
            "questions": [
              {
                "question": "Question text?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correct": 1,
                "explanation": "Why this answer is correct"
              }
            ]
          }
        },
        {
          "id": "mission-2", 
          "title": "Photo Mission Title",
          "description": "Photo task description",
          "type": "photo",
          "xpReward": 50,
          "content": {
            "instructions": "Detailed photo task instructions",
            "requirements": ["Requirement 1", "Requirement 2", "Requirement 3"]
          }
        },
        {
          "id": "mission-3",
          "title": "Reflection Mission Title", 
          "description": "Written reflection description",
          "type": "text",
          "xpReward": 40,
          "content": {
            "prompt": "Reflection prompt for students",
            "minWords": 150,
            "guidelines": ["Guideline 1", "Guideline 2"]
          }
        },
        {
          "id": "mission-4",
          "title": "Tracking Mission Title",
          "description": "Tracking activity description", 
          "type": "tracker",
          "xpReward": 30,
          "content": {
            "trackingDays": 7,
            "metrics": ["Metric 1", "Metric 2"],
            "instructions": "How to track and record data"
          }
        }
      ]
    }
  ]
}

**Important Guidelines:**
- Ensure content is scientifically accurate
- Use age-appropriate language for Grade ${userGrade}
- Include cultural sensitivity for Indian context
- Focus on actionable environmental solutions
- Make missions engaging and practical
- Provide clear, measurable learning outcomes

Generate educational content that inspires students to become environmental champions in ${userState}!
`;
}

// Regional customization prompt
export function createRegionalPrompt(state) {
    const stateInfo = {
        'rajasthan': {
            challenges: ['water scarcity', 'desertification', 'solar energy potential'],
            ecosystems: ['Thar desert', 'Aravalli hills'],
            species: ['Great Indian Bustard', 'Desert Fox']
        },
        'kerala': {
            challenges: ['coastal erosion', 'monsoon flooding', 'backwater pollution'],
            ecosystems: ['Western Ghats', 'backwaters', 'coastal regions'],
            species: ['Nilgiri Tahr', 'Lion-tailed Macaque']
        },
        'maharashtra': {
            challenges: ['urban air pollution', 'water management', 'industrial waste'],
            ecosystems: ['Western Ghats', 'Deccan plateau'],
            species: ['Indian Giant Squirrel', 'Malabar Grey Hornbill']
        },
        'delhi': {
            challenges: ['air pollution', 'urban heat island', 'waste management'],
            ecosystems: ['Yamuna floodplains', 'urban forests'],
            species: ['House Sparrow', 'Blue Bull']
        }
        // Add more states as needed
    };
    
    const info = stateInfo[state.toLowerCase()] || {
        challenges: ['pollution', 'climate change', 'biodiversity loss'],
        ecosystems: ['local forests', 'rivers', 'agricultural areas'],
        species: ['local wildlife']
    };
    
    return `
**Regional Context for ${state}:**
- Key Environmental Challenges: ${info.challenges.join(', ')}
- Important Ecosystems: ${info.ecosystems.join(', ')}
- Notable Species: ${info.species.join(', ')}

Incorporate these specific regional elements into the quest content to make it locally relevant and engaging for students in ${state}.
`;
}

// Quiz generation prompt
export function createQuizPrompt(params) {
    const { topic, difficulty, questionCount = 5, userState, userGrade } = params;
    
    return `
Generate ${questionCount} multiple-choice quiz questions about ${topic} for Grade ${userGrade} students in ${userState}, India.

**Requirements:**
- Difficulty: ${difficulty}
- Include local ${userState} examples where relevant
- Align with NCERT curriculum standards
- Questions should test understanding, not just memorization
- Provide clear explanations for correct answers

**Output Format (JSON):**
{
  "questions": [
    {
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Detailed explanation of why this answer is correct and how it relates to environmental science concepts."
    }
  ]
}

Focus on practical, actionable environmental knowledge relevant to Indian students.
`;
}

// Mission generation prompt
export function createMissionPrompt(params) {
    const { type, category, difficulty, userState, userGrade } = params;
    
    const missionTypes = {
        photo: 'photo documentation task',
        text: 'written reflection assignment', 
        tracker: 'data tracking activity',
        quiz: 'knowledge assessment quiz'
    };
    
    return `
Create a ${missionTypes[type]} for Grade ${userGrade} students in ${userState}, India.

**Context:**
- Mission Type: ${type}
- Category: ${category}
- Difficulty: ${difficulty}
- Regional Focus: ${userState}

**Mission Requirements:**
${type === 'photo' ? `
- Clear photo requirements (3-5 specific shots)
- Safety guidelines for students
- Submission criteria and quality standards
` : ''}
${type === 'text' ? `
- Thought-provoking reflection prompt
- Word count: ${difficulty === 'beginner' ? '100-150' : difficulty === 'intermediate' ? '150-250' : '250-350'} words
- Clear evaluation criteria
` : ''}
${type === 'tracker' ? `
- 7-day tracking period
- 3-4 measurable metrics
- Simple data recording format
- Analysis questions for students
` : ''}

**Output Format (JSON):**
{
  "mission": {
    "title": "Mission Title",
    "description": "Mission description",
    "type": "${type}",
    "xpReward": 40,
    "content": {
      // Type-specific content structure
    }
  }
}

Make the mission engaging, educational, and appropriate for Indian school environment.
`;
}
