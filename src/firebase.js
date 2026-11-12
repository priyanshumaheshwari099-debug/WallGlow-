import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCoFDTBamHsZRjT67dg5vf2_jKEICpb-Cg",
    authDomain: "wallglow-fed76.firebaseapp.com",
    projectId: "wallglow-fed76",
    storageBucket: "wallglow-fed76.firebasestorage.app",
    messagingSenderId: "123747325201",
    appId: "1:123747325201:web:aba97ae43b575e087468b0",
    measurementId: "G-9FLFVJGRP8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Google Authentication
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
    prompt: "select_account"
});

// Initialize Analytics when supported
isSupported().then((supported) => {
    if (supported) {
        getAnalytics(app);
    }
});