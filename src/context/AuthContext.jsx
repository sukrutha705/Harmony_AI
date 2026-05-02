import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, googleProvider } from '../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch extra profile data from Firestore
  const fetchUserProfile = async (uid) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
      } else {
        // If no profile, they might have just signed in with Google for the first time
        // The popup handler creates the doc, so this usually runs after.
        setUserProfile(null);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  function signup(email, password, role, name, phone, gender, address, idNumber) {
    return createUserWithEmailAndPassword(auth, email, password).then(async (userCredential) => {
      // Create user document in Firestore
      const user = userCredential.user;
      const profileData = {
        uid: user.uid,
        email: user.email,
        role: role,
        name: name,
        phone: phone || '',
        gender: gender || '',
        address: address || '',
        idNumber: idNumber || '',
        createdAt: serverTimestamp()
      };
      await setDoc(doc(db, 'users', user.uid), profileData);
      setUserProfile(profileData);
      return userCredential;
    });
  }

  async function login(email, password, role) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    if (role) {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, { role: role }, { merge: true });
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
      }
    }
    return result;
  }

  async function loginWithGoogle(role) {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if they already have a profile
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      // First time Google login -> Create profile
      const profileData = {
        uid: user.uid,
        email: user.email,
        role: role || 'user', // default to user if none specified
        name: user.displayName || 'Google User',
        phone: '',
        createdAt: serverTimestamp()
      };
      await setDoc(docRef, profileData);
      setUserProfile(profileData);
    } else {
      if (role) {
        await setDoc(docRef, { role: role }, { merge: true });
        const updatedSnap = await getDoc(docRef);
        setUserProfile(updatedSnap.data());
      } else {
        setUserProfile(docSnap.data());
      }
    }
    
    return result;
  }

  function logout() {
    return signOut(auth).then(() => {
      setUserProfile(null);
    });
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    login,
    signup,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
