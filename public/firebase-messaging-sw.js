// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Lifecycle: Force immediate activation
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(clients.claim()));

const urlParams = new URL(location).searchParams;

firebase.initializeApp({
    apiKey: urlParams.get('apiKey'),
    authDomain: urlParams.get('authDomain'),
    projectId: urlParams.get('projectId'),
    storageBucket: urlParams.get('storageBucket'),
    messagingSenderId: urlParams.get('messagingSenderId'),
    appId: urlParams.get('appId')
});

const messaging = firebase.messaging();

function getNotificationData(payload) {
    const title = payload.notification?.title || payload.data?.title || 'New Signal';
    const body = payload.notification?.body || payload.data?.body || 'Check the app for updates';

    return {
        title,
        options: {
            body: body,
            icon: '/logo192.png',
            badge: '/logo192.png',
            vibrate: [200, 100, 200],
            tag: 'shahbaz-trades-signal',
            renotify: true,
            data: {
                url: payload.data?.url || '/'
            }
        }
    };
}

// Handler for Firebase library
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Background Message:', payload);
    const { title, options } = getNotificationData(payload);
    return self.registration.showNotification(title, options);
});

// Native push listener for maximum stability on Android
self.addEventListener('push', (event) => {
    console.log('[SW] Push Received');
    let payload = {};
    if (event.data) {
        try {
            payload = event.data.json();
        } catch (e) {
            console.warn('[SW] Push data was not JSON');
        }
    }

    const { title, options } = getNotificationData(payload);
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if ('focus' in client) return client.focus();
            }
            if (clients.openWindow) return clients.openWindow('/');
        })
    );
});
