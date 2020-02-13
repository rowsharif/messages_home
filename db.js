import firebase from "firebase/app";
import "firebase/firestore";

// Initialize Cloud Firestore through Firebase
firebase.initializeApp({
  apiKey: "AIzaSyBwA9Qgdj0o0GycNozhmclhkk4vrrsQoQE",
  authDomain: "messages2-386c4.firebaseapp.com",
  databaseURL: "https://messages2-386c4.firebaseio.com",
  projectId: "messages2-386c4",
  storageBucket: "messages2-386c4.appspot.com",
  messagingSenderId: "150985029783",
  appId: "1:150985029783:web:45b6c968177cdec35d51d2",
  measurementId: "G-DBH76CMB94"
});

export default firebase.firestore();
