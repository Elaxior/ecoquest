import { auth } from '../config/firebase-config.js';
import { completeMission, completeQuest } from '../gamification/rewards.js';
import { showNotification, showProgressNotification } from '../gamification/notifications.js';
import { getQuestById } from './quest-data.js';

// Handle mission completion
export async function handleMissionCompletion(questId, missionId, missionData, userAnswers = null) {
    try {
        if (!auth.currentUser) {
            throw new Error('User not authenticated');
        }
        
        // Validate mission completion based on type
        const isValid = await validateMissionCompletion(missionData, userAnswers);
        
        if (!isValid) {
            showNotification({
                type: 'error',
                title: 'Mission Incomplete',
                message: 'Please complete all required tasks before submitting.'
            });
            return false;
        }
        
        // Get quest data
        const questData = getQuestById(questId);
        if (!questData) {
            throw new Error('Quest not found');
        }
        
        // Complete the mission
        const result = await completeMission(
            auth.currentUser.uid,
            questId,
            missionId,
            missionData.xpReward,
            questData.difficulty
        );
        
        // Check if quest is now complete
        const questProgress = await checkQuestCompletion(questId, questData);
        
        if (questProgress.isComplete) {
            await completeQuest(auth.currentUser.uid, questId, questData);
        } else {
            showProgressNotification(
                questData.title, 
                questProgress.completedMissions, 
                questProgress.totalMissions
            );
        }
        
        return {
            success: true,
            missionComplete: true,
            questComplete: questProgress.isComplete,
            xpAwarded: result.xpAwarded,
            newLevel: result.newLevel,
            leveledUp: result.leveledUp
        };
        
    } catch (error) {
        console.error('Error completing mission:', error);
        showNotification({
            type: 'error',
            title: 'Error',
            message: 'Failed to complete mission. Please try again.'
        });
        return { success: false, error: error.message };
    }
}

// Validate mission completion based on type
async function validateMissionCompletion(missionData, userAnswers) {
    switch (missionData.type) {
        case 'quiz':
            return validateQuizCompletion(missionData, userAnswers);
        case 'photo':
            return validatePhotoCompletion(missionData, userAnswers);
        case 'text':
            return validateTextCompletion(missionData, userAnswers);
        case 'tracker':
            return validateTrackerCompletion(missionData, userAnswers);
        default:
            return true;
    }
}

// Validate quiz completion
function validateQuizCompletion(missionData, userAnswers) {
    if (!userAnswers || !Array.isArray(userAnswers)) {
        return false;
    }
    
    const questions = missionData.content.questions;
    if (userAnswers.length !== questions.length) {
        return false;
    }
    
    // Check if all questions are answered
    return userAnswers.every(answer => answer !== null && answer !== undefined);
}

// Validate photo completion
function validatePhotoCompletion(missionData, userAnswers) {
    if (!userAnswers || !userAnswers.photos) {
        return false;
    }
    
    const requiredPhotos = missionData.content.requirements.length;
    return userAnswers.photos.length >= requiredPhotos;
}

// Validate text completion
function validateTextCompletion(missionData, userAnswers) {
    if (!userAnswers || !userAnswers.text) {
        return false;
    }
    
    const minWords = missionData.content.minWords || 50;
    const wordCount = userAnswers.text.trim().split(/\s+/).length;
    
    return wordCount >= minWords;
}

// Validate tracker completion
function validateTrackerCompletion(missionData, userAnswers) {
    if (!userAnswers || !userAnswers.entries) {
        return false;
    }
    
    const requiredDays = missionData.content.trackingDays;
    return userAnswers.entries.length >= requiredDays;
}

// Check if quest is complete
async function checkQuestCompletion(questId, questData) {
    try {
        const userData = await getUserData(auth.currentUser.uid);
        const questProgress = userData.questProgress?.[questId];
        
        if (!questProgress) {
            return { isComplete: false, completedMissions: 0, totalMissions: questData.missions.length };
        }
        
        const completedMissions = questProgress.completedMissions?.length || 0;
        const totalMissions = questData.missions.length;
        const isComplete = completedMissions === totalMissions;
        
        return { isComplete, completedMissions, totalMissions };
        
    } catch (error) {
        console.error('Error checking quest completion:', error);
        return { isComplete: false, completedMissions: 0, totalMissions: questData.missions.length };
    }
}

// Calculate quiz score
export function calculateQuizScore(questions, userAnswers) {
    if (!userAnswers || !Array.isArray(userAnswers)) {
        return { score: 0, percentage: 0, results: [] };
    }
    
    let correct = 0;
    const results = questions.map((question, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === question.correct;
        if (isCorrect) correct++;
        
        return {
            question: question.question,
            userAnswer: userAnswer,
            correctAnswer: question.correct,
            isCorrect: isCorrect,
            explanation: question.explanation
        };
    });
    
    const percentage = Math.round((correct / questions.length) * 100);
    
    return {
        score: correct,
        total: questions.length,
        percentage: percentage,
        results: results
    };
}

// Handle quiz submission
export async function handleQuizSubmission(questId, missionId, questions, userAnswers) {
    const quizResult = calculateQuizScore(questions, userAnswers);
    
    // Show quiz results
    showQuizResults(quizResult);
    
    // Complete the mission regardless of score (educational focus)
    const missionData = {
        type: 'quiz',
        xpReward: 25 + (quizResult.percentage > 80 ? 10 : 0) // Bonus XP for high scores
    };
    
    return await handleMissionCompletion(questId, missionId, missionData, userAnswers);
}

// Show quiz results
function showQuizResults(quizResult) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-8">
                <div class="text-center mb-6">
                    <div class="text-6xl mb-4">${quizResult.percentage >= 80 ? '🎉' : quizResult.percentage >= 60 ? '👏' : '💪'}</div>
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
                    <p class="text-lg text-gray-600">You got ${quizResult.score} out of ${quizResult.total} questions correct</p>
                    <div class="text-3xl font-bold text-primary mt-2">${quizResult.percentage}%</div>
                </div>
                
                <div class="space-y-4 mb-6">
                    ${quizResult.results.map((result, index) => `
                        <div class="border rounded-lg p-4 ${result.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}">
                            <div class="flex items-start gap-2 mb-2">
                                <div class="text-xl">${result.isCorrect ? '✅' : '❌'}</div>
                                <div class="flex-1">
                                    <div class="font-medium text-gray-900 mb-2">Question ${index + 1}: ${result.question}</div>
                                    <div class="text-sm text-gray-600 mb-2">
                                        Your answer: <strong>${['A', 'B', 'C', 'D'][result.userAnswer]}</strong>
                                        ${!result.isCorrect ? ` | Correct answer: <strong>${['A', 'B', 'C', 'D'][result.correctAnswer]}</strong>` : ''}
                                    </div>
                                    <div class="text-sm text-gray-700 italic">${result.explanation}</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="text-center">
                    <button onclick="this.closest('.fixed').remove()" 
                            class="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-all">
                        Continue Learning
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}
