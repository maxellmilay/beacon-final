'use client';

import app from '@/db/firebase';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  setPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
} from 'firebase/auth';
import { UserInterface } from '@/interface/authInterface';
import { Dispatch, SetStateAction } from 'react';
import { getSingleUser, postInitialUserData, refreshUserData } from './store';

const provider = new GoogleAuthProvider();
const auth = getAuth(app);

export const handleSignIn = async (
  setUser: Dispatch<SetStateAction<UserInterface>>,
  setHasAccount: Dispatch<SetStateAction<boolean>>,
  setHasAccounData: Dispatch<SetStateAction<boolean>>
) => {
  let userData = {} as UserInterface;
  await setPersistence(auth, browserSessionPersistence);
  await signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      if (user.displayName && user.email) {
        userData = {
          name: user.displayName,
          email: user.email,
          nodeNumber: 2,
          nodes: [
            {
              id: 'Node 1',
              label: 'You',
              details: {
                description: 'Root',
              },
              group: 1,
            },
          ],
          links: [],
        };
      }
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(errorCode, errorMessage);
    });

  if (userData) {
    const existingUser = await getSingleUser(userData.email);
    if (existingUser.email) {
      if (existingUser.links?.length) {
        refreshUserData(userData, setUser);
        setHasAccounData(true);
        return;
      }
    } else {
      postInitialUserData(userData);
    }
    setUser(userData);
    setHasAccount(true);
  }
};

export const handleAuthStateChange = async (
  user: UserInterface,
  setUser: Dispatch<SetStateAction<UserInterface>>
) => {
  onAuthStateChanged(auth, (u) => {
    console.log('LOG: Auth State Data', u);
    if (u?.email && u?.displayName) {
      const userData = {
        ...user,
        name: u.displayName,
        email: u.email,
      };
      refreshUserData(userData, setUser);
    }
  });
};

export const handleSignOut = () => {
  signOut(auth)
    .then(() => {
      // Redirect to login page
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(errorCode, errorMessage);
    });
};

export default auth;
