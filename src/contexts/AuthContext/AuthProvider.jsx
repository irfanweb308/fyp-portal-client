import React, { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { auth } from '../../firebase/firebase.init';

const API_URL = "http://localhost:8000";

const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);

    const createUser = (email, password) => {
        setLoading(true);
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const signInUser = (email, password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password);
    };

    const signOutUser = () => {
        setLoading(true);
        return signOut(auth);
    };

    useEffect(() => {
        const unSubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            // if logged out
            if (!currentUser) {
                setRole(null);
                setLoading(false);
                return;
            }


            try {
                const res = await fetch(`${API_URL}/users/${currentUser.uid}`);
                if (res.status === 404) {
                     
                    setRole(null);
                    setLoading(false);
                    return;
                }

                const data = await res.json();
                setRole(data.role || null);
            } catch (err) {
                console.log("Error fetching user role:", err);
                setRole(null);
            } finally {
                setLoading(false);
            }
        });

        return () => unSubscribe();
    }, []);

    const authInfo = {
        loading,
        user,
        role,
        createUser,
        signInUser,
        signOutUser
    };

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
