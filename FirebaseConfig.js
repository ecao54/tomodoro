// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA0MJP_yzM4Lxe9B8lojOnOoiAoaDdtL-U",
  authDomain: "tomodoro-a79e4.firebaseapp.com",
  projectId: "tomodoro-a79e4",
  storageBucket: "tomodoro-a79e4.firebasestorage.app",
  messagingSenderId: "576866654863",
  appId: "1:576866654863:web:77e30e9be103cf6584eefa",
  measurementId: "G-3EDTESN9KX"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(AsyncStorage)
});
