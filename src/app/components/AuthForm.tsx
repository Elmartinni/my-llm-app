// components/AuthForm.tsx
'use client';

import { useState } from 'react';
import { auth } from '@/app/lib/firebase/config'; // Adjust path if needed
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  AuthError,
} from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import Image from 'next/image'; // Import next/image

// Simple validation function (you might want a more robust library like Zod)
const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export default function AuthForm() {
  const [user, loading, error] = useAuthState(auth); // Hook to get auth state
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError(null); // Clear previous errors

    if (!validateEmail(email)) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        // Redirect or state update on successful login will be handled by useAuthState
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        // Redirect or state update on successful signup will be handled by useAuthState
      }
      // No need to manually redirect here if useAuthState handles it elsewhere
      // or if you want the user to stay on the page after login/signup
      // For this example, we'll just clear the form
      setEmail('');
      setPassword('');
    } catch (err) {
      const firebaseError = err as AuthError;
      console.error("Firebase Auth Error:", firebaseError);
      // Provide user-friendly messages
      switch (firebaseError.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setAuthError('Invalid email or password.');
          break;
        case 'auth/email-already-in-use':
          setAuthError('This email address is already registered.');
          break;
        case 'auth/weak-password':
          setAuthError('Password is too weak. Please use at least 6 characters.');
          break;
        case 'auth/invalid-email':
           setAuthError('Please enter a valid email address.');
           break;
        default:
          setAuthError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // Successful sign-in handled by useAuthState
    } catch (err) {
       const firebaseError = err as AuthError;
       console.error("Google Sign-In Error:", firebaseError);
       if (firebaseError.code !== 'auth/popup-closed-by-user') {
           setAuthError('Failed to sign in with Google. Please try again.');
       }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setAuthError(null); // Clear errors when switching modes
    setEmail(''); // Optionally clear fields
    setPassword(''); // Optionally clear fields
  };

  // If user is logged in, you might want to show a different UI or redirect
  if (loading) {
    return <div className="flex justify-center items-center h-full"><p>Loading...</p></div>;
  }

  if (user) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow-xl">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Welcome back!</h2>
        <p className="text-gray-600 mb-6">You are logged in as {user.email}.</p>
        {/* Add a button to go to the chat or dashboard */}
        <button
          onClick={() => auth.signOut()} // Simple sign out for example
          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
        >
          Sign Out
        </button>
         {/* Example link to a chat page */}
         {/* <Link href="/chat">
           <a className="mt-4 inline-block w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out text-center">
             Go to Chat
           </a>
         </Link> */}
      </div>
    );
  }

  // Login/Signup Form
  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold text-center text-gray-800">
        {isLogin ? 'Welcome Back' : 'Create Account'}
      </h2>
      <p className="text-center text-gray-500">
        {isLogin ? 'Login to access your chat.' : 'Sign up to start chatting.'}
      </p>

      {/* Google Sign-In Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150 ease-in-out"
      >
        <Image src="/Google_2015_logo.svg" alt="Google logo" width={20} height={20} className="mr-2" />
        Sign in with Google
      </button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or {isLogin ? 'login' : 'sign up'} with email</span>
        </div>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleAuthAction} className="space-y-4">
        {authError && (
          <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded">{authError}</p>
        )}
        <div>
          <label htmlFor="email" className="sr-only">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm disabled:opacity-50"
            placeholder="Email address"
          />
        </div>
        <div>
          <label htmlFor="password" className="sr-only">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm disabled:opacity-50"
            placeholder="Password (min. 6 characters)"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150 ease-in-out"
        >
          {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
        </button>
      </form>

      <p className="text-sm text-center text-gray-600">
        {isLogin ? "Don't have an account?" : 'Already have an account?'}
        <button
          type="button"
          onClick={toggleMode}
          disabled={isLoading}
          className="ml-1 font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline disabled:opacity-50"
        >
          {isLogin ? 'Sign Up' : 'Sign In'}
        </button>
      </p>
    </div>
  );
}
