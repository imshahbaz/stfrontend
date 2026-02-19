import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import { notificationAPI } from "./api/axios";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "...",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "...",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "...",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "...",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "...",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "...",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "..."
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

import { onMessage } from "firebase/messaging";

export const requestNotificationPermission = async () => {
    try {
        if (!('serviceWorker' in navigator) || !('Notification' in window)) {
            console.error('Browser does not support service workers or notifications');
            return null;
        }

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const swConfig = new URLSearchParams({
                apiKey: firebaseConfig.apiKey,
                authDomain: firebaseConfig.authDomain,
                projectId: firebaseConfig.projectId,
                storageBucket: firebaseConfig.storageBucket,
                messagingSenderId: firebaseConfig.messagingSenderId,
                appId: firebaseConfig.appId,
            }).toString();

            const registration = await navigator.serviceWorker.register(`/firebase-messaging-sw.js?${swConfig}`, {
                scope: '/'
            });

            const token = await getToken(messaging, {
                serviceWorkerRegistration: registration,
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
            });

            if (token) {
                await notificationAPI.saveToken(token);
                return token;
            }
        }
    } catch (error) {
        console.error('Error getting notification permission/token:', error);
    }
    return null;
};

// Handle foreground messages
onMessage(messaging, (payload) => {
    console.log('Foreground message received: ', payload);
    // You could show a custom toast here if needed
});

export { messaging };
