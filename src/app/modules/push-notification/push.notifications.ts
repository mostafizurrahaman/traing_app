import admin from 'firebase-admin';
import * as dotenv from 'dotenv';
dotenv.config();

let isFirebaseInitialized = false;

try {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (projectId && privateKey && clientEmail) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          privateKey,
          clientEmail,
        }),
      });
    }
    isFirebaseInitialized = true;
  } else {
    console.warn(
      '⚠️ Firebase credentials (FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL) not found. Push notifications will be skipped.',
    );
  }
} catch (error) {
  console.error('⚠️ Firebase initialization error:', error);
}

interface NotificationPayload {
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, string>;
}

interface SendNotificationInput {
  fcmToken: string;
  payload: NotificationPayload;
}

async function sendPushNotification({
  fcmToken,
  payload,
}: SendNotificationInput): Promise<void> {
  console.log('Send notification:', fcmToken, payload);

  if (!isFirebaseInitialized) {
    console.log('Firebase is not initialized. Skipping push notification.');
    return;
  }

  if (!fcmToken) {
    console.log('No FCM token provided.');
    return;
  }

  const message: admin.messaging.Message = {
    notification: {
      title: payload.title,
      body: payload.body,
    },
    data: payload.data || {},
    token: fcmToken,
    android: {
      notification: {
        sound: 'default',
        priority: 'high',
      },
    },
    apns: {
      payload: {
        aps: {
          alert: {
            title: payload.title,
            body: payload.body,
          },
          sound: 'default',
        },
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent notification:', response);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}

export { sendPushNotification };



