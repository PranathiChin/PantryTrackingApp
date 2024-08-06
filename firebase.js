// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyD060jkOz-bYMeQY1YCNQFP46Qffm72oJU",
    authDomain: "hspantryapp-db738.firebaseapp.com",
    projectId: "hspantryapp-db738",
    storageBucket: "hspantryapp-db738.appspot.com",
    messagingSenderId: "752283364160",
    appId: "1:752283364160:web:9b1ab0c8cb3490b315a8a5",
    measurementId: "G-M86R2ZXWW6"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const firestore = getFirestore(app);

export {
  app, firestore
}
