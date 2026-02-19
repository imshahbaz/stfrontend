// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const urlParams = new URL(location).searchParams;

firebase.initializeApp({
    apiKey: urlParams.get('apiKey'),
    projectId: urlParams.get('projectId'),
    messagingSenderId: urlParams.get('messagingSenderId'),
    appId: urlParams.get('appId')
});

const messaging = firebase.messaging();

// Foreground/Background handler
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    // Check if we have notification or data
    const title = payload.notification?.title || payload.data?.title || 'New Message';
    const body = payload.notification?.body || payload.data?.body || '';

    const notificationOptions = {
        body: body,
        icon: '/logo192.png',
        badge: '/logo192.png', // Small icon for top bar on Android
        vibrate: [100, 50, 100],
        data: {
            url: '/' // Home page URL
        }
    };

    self.registration.showNotification(title, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // If a window is already open, focus it
            for (const client of clientList) {
                if (client.url === '/' && 'focus' in client) return client.focus();
            }
            // Otherwise open a new window
            if (clients.openWindow) return clients.openWindow('/');
        })
    );
});
