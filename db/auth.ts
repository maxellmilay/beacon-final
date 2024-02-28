import app from '@/db/firebase';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { UserInterface } from '@/interface/authInterface';
import { Dispatch, SetStateAction } from 'react';
import { postInitialUserData } from './store';

const provider = new GoogleAuthProvider();
const auth = getAuth(app);

export const handleSignIn = async(setUser: Dispatch<SetStateAction<UserInterface>>) => {

    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;

        if(user.displayName && user.email) {
          let userData = {
            name: user.displayName,
            email: user.email
          }
          postInitialUserData(userData);
          setUser(userData)
        }

      }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorCode, errorMessage)
      });
}

export const handleSignOut = () => {
    signOut(auth).then(() => {
        // Redirect to login page
      }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorCode, errorMessage)
      });
}

export default auth;

