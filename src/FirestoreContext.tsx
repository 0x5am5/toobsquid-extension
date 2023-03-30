import React, { createContext, useContext, ReactNode } from "react";
import dayjs from "dayjs";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "./firebase";
import { updateProfile } from "firebase/auth";

const FirestoreContext = createContext<any>({});

export const useFirestore = () => useContext(FirestoreContext);

export const FirestoreContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const logLatestLogin = async (uid: string) => {
    const docRef = doc(db, "YT Users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      await updateDoc(doc(db, "YT Users", uid), {
        latestLogin: dayjs().toString(),
      });
    } else {
      console.log("No daily logs!");
    }
  };

  const getUser = async (uid: string) => {
    const docRef = doc(db, "YT Users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return false;
    }
  };

  const getTitles = async (uid: string) => {
    const docRef = doc(db, "YT Users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      return {
        titles: data.titles,
      };
    } else {
      console.log("No titles in user!");
      return { titles: [] };
    }
  };

  const deleteTitle = async (
    uid: string,
    titleID: string,
    timeStamp: number
  ) => {
    const docRef = doc(db, "YT Users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const titles = data.titles.filter((title: any) => {
        if (Object.entries(title)[0][0] === titleID) {
          const titleData: any = Object.entries(title)[0][1];
          return titleData.timeStamp !== timeStamp;
        } else {
          return true;
        }
      });

      await updateDoc(doc(db, "YT Users", uid), { titles });

      return titles;
    } else {
      console.log("No titles in user!");
      return "No user found";
    }
  };

  const updateAccountDetails = async (
    uid: string,
    data: { displayName: string; email: string; openAIKey: string }
  ) => {
    const docRef = doc(db, "YT Users", uid);
    const docSnap = await await getDoc(docRef);

    if (docSnap.exists()) {
      const userData = {
        displayName: data.displayName
          ? data.displayName
          : docSnap.data().displayName,
        email: data.email ? data.email : docSnap.data().email,
        ...(data.openAIKey && { openAIKey: data.openAIKey }),
      };

      await updateDoc(doc(db, "YT Users", uid), userData);

      if (userData.displayName && auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: userData.displayName,
        });
      }

      return userData;
    } else {
      console.log("No user with that uid!");
    }
  };

  return (
    <FirestoreContext.Provider
      value={{
        getUser,
        logLatestLogin,
        updateAccountDetails,
        getTitles,
        deleteTitle,
      }}
    >
      {children}
    </FirestoreContext.Provider>
  );
};
