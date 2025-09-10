import { auth, db } from '../config/firebase-config.js';
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Fix missing user document for current user
export async function fixCurrentUserDocument() {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.log('No user logged in');
            return false;
        }
        
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
            console.log('Creating missing user document...');
            
            await setDoc(userRef, {
                email: user.email,
                displayName: user.displayName || user.email.split('@')[0],
                school: 'Not specified',
                state: 'Not specified',
                createdAt: new Date(),
                lastActive: new Date(),
                xp: 0,
                level: 1,
                questsCompleted: 0,
                badges: [],
                questProgress: {},
                stats: {
                    totalMissions: 0,
                    currentStreak: 0,
                    longestStreak: 0,
                    xpGainedToday: 0,
                    questsByCategory: {},
                    missionsByType: {}
                }
            });
            
            console.log('User document created successfully!');
            return true;
        } else {
            console.log('User document already exists');
            return false;
        }
        
    } catch (error) {
        console.error('Error fixing user document:', error);
        throw error;
    }
}
