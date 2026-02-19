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

export const requestNotificationPermission = async () => {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            // Register service worker with config parameters
            const swConfig = new URLSearchParams({
                apiKey: firebaseConfig.apiKey,
                projectId: firebaseConfig.projectId,
                messagingSenderId: firebaseConfig.messagingSenderId,
                appId: firebaseConfig.appId,
            }).toString();

            const registration = await navigator.serviceWorker.register(`/firebase-messaging-sw.js?${swConfig}`);

            const token = await getToken(messaging, {
                serviceWorkerRegistration: registration,
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || 'YOUR_PUBLIC_VAPID_KEY'
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

export { messaging };
