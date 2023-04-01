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
  const getUser = async (uid: string) => {
    const docRef = doc(db, "YT Users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return false;
    }
  };

  return (
    <FirestoreContext.Provider
      value={{
        getUser,
      }}
    >
      {children}
    </FirestoreContext.Provider>
  );
};
