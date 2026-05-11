// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

// Access query parameters to get the config dynamically (if needed) or hardcode public safe variables
// Using search params in the sw registration is a common way to pass env vars to a service worker

self.addEventListener('install', (event) => {
    console.log('Firebase Service Worker installing.');
});

self.addEventListener('activate', (event) => {
    console.log('Firebase Service Worker activated.');
});

// We need to initialize firebase in the service worker
const firebaseConfig = {
  // These will need to be populated dynamically or via a build step if using Vite
  // For now, these must be hardcoded or injected because Service Workers can't access import.meta.env
  // Alternatively, we can use an approach where we fetch config from a local JSON or URL params.
};

// To make this fully dynamic with Vite, a common approach is to just rely on the default behavior
// If the backend sends a "notification" payload, the browser handles it automatically if the app is closed.
// If the backend sends a "data" payload, onBackgroundMessage catches it.

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
// firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
// const messaging = firebase.messaging();

// messaging.onBackgroundMessage((payload) => {
//   console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
//   // Broadcast to React app if open but in background
//   const channel = new BroadcastChannel('fcm-messages');
//   channel.postMessage(payload);
  
//   // Optionally customize notification here
//   const notificationTitle = payload.notification?.title || 'Analysis Complete';
//   const notificationOptions = {
//     body: payload.notification?.body || 'Your analysis has been processed successfully.',
//     icon: '/favicon.svg'
//   };

//   self.registration.showNotification(notificationTitle, notificationOptions);
// });

self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click Received.', event);
  
  event.notification.close();
  
  // Navigate to the analysis page when clicked
  const urlToOpen = new URL('/analysis-inbody', self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        // If so, just focus it
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, then open the target URL in a new window/tab
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
