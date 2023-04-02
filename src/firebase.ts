// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// Prod
const firebaseConfig = {
  apiKey: "AIzaSyBoRH_vQa2ZfRb3qdSPU4zfukcPhR5behA",
  authDomain: "yt-meta-ai.firebaseapp.com",
  projectId: "yt-meta-ai",
  storageBucket: "yt-meta-ai.appspot.com",
  messagingSenderId: "971484684869",
  appId: "1:971484684869:web:bf5bde6ce8e10fb687392c",
  measurementId: "G-NTH77KHQZC"
};

// Dev
// const firebaseConfig = {
//   apiKey: "AIzaSyD4VkB9FjrX0Cz4jnWsN8OFuq3Vowmfg3o",
//   authDomain: "gpt-cockney-rhyming-slan-802b8.firebaseapp.com",
//   projectId: "gpt-cockney-rhyming-slan-802b8",
//   storageBucket: "gpt-cockney-rhyming-slan-802b8.appspot.com",
//   messagingSenderId: "496773240710",
//   appId: "1:496773240710:web:d44fbde7fe5de6e4703e07",
//   measurementId: "G-1N4B5NHY36",
// };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const provider = new GoogleAuthProvider();

export const db = getFirestore(app);
export const auth = getAuth()