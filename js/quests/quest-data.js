// Complete quest data with all missions
export const QUEST_DATA = {
    'water-conservation-basics': {
        id: 'water-conservation-basics',
        title: 'Water Conservation Basics',
        description: 'Learn essential water-saving techniques for your daily routine and implement conservation practices at home and school.',
        category: 'water-conservation',
        categoryName: 'Water Conservation',
        difficulty: 'beginner',
        estimatedTime: '45 minutes',
        xpReward: 150,
        icon: '💧',
        color: 'blue',
        regions: ['national'],
        prerequisites: [],
        featured: true,
        missions: [
            {
                id: 'mission-1',
                title: 'Understanding Water Cycle',
                description: 'Learn about the water cycle and why conservation matters',
                type: 'quiz',
                xpReward: 25,
                completed: false,
                content: {
                    questions: [
                        {
                            question: 'What percentage of Earth\'s water is fresh water?',
                            options: ['97%', '3%', '50%', '10%'],
                            correct: 1,
                            explanation: 'Only about 3% of Earth\'s water is fresh water, making conservation crucial.'
                        },
                        {
                            question: 'Which process converts water vapor back to liquid?',
                            options: ['Evaporation', 'Condensation', 'Precipitation', 'Collection'],
                            correct: 1,
                            explanation: 'Condensation is the process where water vapor cools and becomes liquid water.'
                        }
                    ]
                }
            },
            {
                id: 'mission-2',
                title: 'Home Water Audit',
                description: 'Conduct a water audit in your home and identify conservation opportunities',
                type: 'photo',
                xpReward: 50,
                completed: false,
                content: {
                    instructions: 'Take photos of different water sources in your home (taps, showers, etc.) and note any leaks or inefficiencies.',
                    requirements: ['Photo of water meter reading', 'Photos of all major water fixtures', 'List of observed water wastage']
                }
            },
            {
                id: 'mission-3',
                title: 'Water-Saving Action Plan',
                description: 'Create and implement a personal water conservation plan',
                type: 'text',
                xpReward: 50,
                completed: false,
                content: {
                    prompt: 'Write a detailed plan outlining 5 specific water conservation actions you will implement in your daily routine.',
                    minWords: 200,
                    guidelines: [
                        'Include specific water-saving techniques',
                        'Mention target water reduction goals',
                        'Describe how you will track progress',
                        'Include family/community involvement strategies'
                    ]
                }
            },
            {
                id: 'mission-4',
                title: 'Conservation Progress Report',
                description: 'Track your water usage for one week and report results',
                type: 'tracker',
                xpReward: 25,
                completed: false,
                content: {
                    trackingDays: 7,
                    metrics: ['Daily water meter reading', 'Conservation actions taken', 'Water saved (estimated)'],
                    instructions: 'Log your daily water usage and conservation efforts for one week.'
                }
            }
        ]
    },
    'waste-segregation': {
        id: 'waste-segregation',
        title: 'Smart Waste Segregation',
        description: 'Master the art of proper waste sorting, recycling, and composting to minimize environmental impact.',
        category: 'waste-management',
        categoryName: 'Waste Management',
        difficulty: 'beginner',
        estimatedTime: '60 minutes',
        xpReward: 200,
        icon: '♻️',
        color: 'green',
        regions: ['national'],
        prerequisites: [],
        featured: false,
        missions: [
            {
                id: 'mission-1',
                title: 'Waste Categories Quiz',
                description: 'Learn to identify different types of waste and their proper disposal methods',
                type: 'quiz',
                xpReward: 30,
                completed: false,
                content: {
                    questions: [
                        {
                            question: 'Which bin should plastic bottles go in?',
                            options: ['Organic waste', 'Dry recyclable', 'Hazardous waste', 'General waste'],
                            correct: 1,
                            explanation: 'Plastic bottles are recyclable and should go in the dry recyclable waste bin.'
                        },
                        {
                            question: 'What is composting?',
                            options: ['Burning waste', 'Burying waste', 'Breaking down organic matter', 'Recycling plastic'],
                            correct: 2,
                            explanation: 'Composting is the process of breaking down organic matter into nutrient-rich soil.'
                        }
                    ]
                }
            },
            {
                id: 'mission-2',
                title: 'Home Waste Segregation Setup',
                description: 'Set up a proper waste segregation system at home',
                type: 'photo',
                xpReward: 60,
                completed: false,
                content: {
                    instructions: 'Create a 4-bin waste segregation system: Organic, Dry Recyclable, Hazardous, and General Waste.',
                    requirements: ['Photo of 4 labeled waste bins', 'Before/after photos of waste sorting area', 'Photo of family practicing segregation']
                }
            }
        ]
    },
    'energy-saving': {
        id: 'energy-saving',
        title: 'Energy Saving Champion',
        description: 'Discover renewable energy sources and implement energy-saving methods to reduce your carbon footprint.',
        category: 'energy-saving',
        categoryName: 'Energy Conservation',
        difficulty: 'intermediate',
        estimatedTime: '90 minutes',
        xpReward: 250,
        icon: '⚡',
        color: 'yellow',
        regions: ['national'],
        prerequisites: [],
        featured: true,
        missions: [
            {
                id: 'mission-1',
                title: 'Energy Sources and Efficiency',
                description: 'Learn about renewable vs non-renewable energy and efficiency principles',
                type: 'quiz',
                xpReward: 40,
                completed: false,
                content: {
                    questions: [
                        {
                            question: 'Which is a renewable energy source?',
                            options: ['Coal', 'Solar', 'Natural Gas', 'Oil'],
                            correct: 1,
                            explanation: 'Solar energy is renewable as it comes from the sun which provides continuous energy.'
                        },
                        {
                            question: 'What does LED stand for?',
                            options: ['Light Emitting Diode', 'Low Energy Device', 'Light Efficient Display', 'Long Electric Duration'],
                            correct: 0,
                            explanation: 'LED stands for Light Emitting Diode, which uses much less energy than traditional bulbs.'
                        }
                    ]
                }
            }
        ]
    }
};

// Helper functions
export function getQuestById(questId) {
    return QUEST_DATA[questId] || null;
}

export function getAllQuests() {
    return Object.values(QUEST_DATA);
}

export function getQuestsByCategory(category) {
    return Object.values(QUEST_DATA).filter(quest => quest.category === category);
}

export function getFeaturedQuests() {
    return Object.values(QUEST_DATA).filter(quest => quest.featured);
}

export function searchQuests(query) {
    const lowercaseQuery = query.toLowerCase();
    return Object.values(QUEST_DATA).filter(quest =>
        quest.title.toLowerCase().includes(lowercaseQuery) ||
        quest.description.toLowerCase().includes(lowercaseQuery) ||
        quest.categoryName.toLowerCase().includes(lowercaseQuery)
    );
}
