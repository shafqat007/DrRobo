import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

const firebaseConfig = {
    apiKey: "AIzaSyCBrnySSYAgkxmwtHQ76n-HS9vifiUsYnU",
    authDomain: "robodoc-504b8.firebaseapp.com",
    databaseURL: "https://robodoc-504b8-default-rtdb.firebaseio.com",
    projectId: "robodoc-504b8",
    storageBucket: "robodoc-504b8.appspot.com",
    messagingSenderId: "55159383406",
    appId: "1:55159383406:web:93f5f8339bf75cab3bcd7f"
  };

  
if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
  console.log('Firebase initialized');
}

const db = firebase.database();
export { db };
