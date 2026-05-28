const firebaseConfig = {
    apiKey: "AIzaSyCv34NYAI2n-GWAHQdzK8PhDDSJIK-88LY",
    authDomain: "techlabdb.firebaseapp.com",
    projectId: "techlabdb",
    storageBucket: "techlabdb.firebasestorage.app",
    messagingSenderId: "642784883327",
    appId: "1:642784883327:web:959493152d242f6e03c54a"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
