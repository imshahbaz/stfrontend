// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyCBu_s7-xSJHmjzicPLHCVE9rGxgeCFTas",
    authDomain: "shahbaz-trades-96206.firebaseapp.com",
    projectId: "shahbaz-trades-96206",
    storageBucket: "shahbaz-trades-96206.firebasestorage.app",
    messagingSenderId: "1042092550487",
    appId: "1:1042092550487:web:f982bed83079c088243612",
    measurementId: "G-M91Y2FYJ4R"
});

const messaging = firebase.messaging();

// Foreground/Background handler
messaging.onBackgroundMessage((payload) => {
    self.registration.showNotification(payload.data.title, {
        body: payload.data.body,
        icon: '/logo192.png'
    });
});
