const { initializeApp, cert } = require('firebase-admin/app');
const path = require('path');

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (err) {
    console.error('Invalid FIREBASE_SERVICE_ACCOUNT JSON:', err.message);
    throw new Error('FIREBASE_SERVICE_ACCOUNT must be valid JSON. Received invalid JSON string.');
  }
} else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
  const serviceAccountPath = path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
  try {
    serviceAccount = require(serviceAccountPath);
  } catch (err) {
    console.error('Unable to load Firebase service account from path:', serviceAccountPath, err.message);
    throw err;
  }
} else {
  serviceAccount = require('../config/serviceAccountKey.json');
}

initializeApp({
  credential: cert(serviceAccount),
});

module.exports = require('firebase-admin');
