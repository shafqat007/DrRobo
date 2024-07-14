import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

const firebaseConfig = {
  apiKey: "AIzaSyB5GhVtQa2CaoYMvogplfPbKr8ZNmMLoG0",
  authDomain: "robodoc-5fb7a.firebaseapp.com",
  projectId: "robodoc-5fb7a",
  storageBucket: "robodoc-5fb7a.appspot.com",
  messagingSenderId: "326241573536",
  appId: "1:326241573536:web:3a34bb9c82f334aa9c47c5",
  measurementId: "G-DQJC056XKL"
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
  console.log('Firebase initialized');
}

const db = firebase.database();
export { db };
