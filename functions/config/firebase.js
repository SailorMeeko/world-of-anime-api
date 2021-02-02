const firebase = require('firebase');
const functions = require('firebase-functions');

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || functions.config().woa.firebaseapikey,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || functions.config().woa.firebaseauthdomain,
    databaseURL: process.env.FIREBASE_DATABASE_URL || functions.config().woa.firebasedatabaseurl,
    projectId: process.env.FIREBASE_PROJECT_ID || functions.config().woa.firebaseprojectid,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || functions.config().woa.firebasestoragebucket,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || functions.config().woa.firebasemessagingsenderid,
    appId: process.env.FIREBASE_APP_ID || functions.config().woa.firebaseappid
};



if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

module.exports = firebase;