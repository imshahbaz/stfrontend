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
    self.registration.showNotification(payload.data.title, {
        body: payload.data.body,
        icon: '/logo192.png'
    });
});
