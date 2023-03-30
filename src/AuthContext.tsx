import React, {
  createContext,
  useContext,
  useEffect,
  ReactNode,
  useState,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db, provider } from "./firebase";
import { useFirestore } from "./FirestoreContext";
import { doc, onSnapshot } from "firebase/firestore";

const AuthContext = createContext<any>({});

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const { getUser, logLatestLogin, updateAccountDetails } = useFirestore();
  const [user, setUser] = useState<any>("loading");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let listen: any;
    const unlisten = onAuthStateChanged(auth, async (authUser: any) => {
      try {
        const setupUser = async (userData: any) => {
          await logLatestLogin(authUser.uid);

          setUser({
            uid: authUser.uid,
            email: authUser.email,
            displayName: userData.displayName || authUser.displayName || "",
            startDate: userData.startDate,
            latestLogin: userData.latestLogin,
            subscribed: userData.subscribed,
            providerId: authUser.providerData[0].providerId,
            titles: userData.titles,
            openAIKey: userData.openAIKey,
            plan: userData.plan,
            customerID: userData.customerID,
            channelID: userData.channelID,
            credits: userData.credits,
            tester: userData.tester,
          });
        };

        if (authUser !== null) {
          const userData = await getUser(authUser.uid);

          if (userData) {
            setupUser(userData);
          } else {
            listen = onSnapshot(
              doc(db, "YT Users", authUser.uid),
              { includeMetadataChanges: true },
              async (doc: any) => {
                if (doc.data()) {
                  setupUser(doc.data());
                  if (!doc.data().displayName) {
                    await updateAccountDetails(doc.id, {
                      displayName: authUser.displayName,
                    });
                  }
                  listen();
                }
              }
            );
          }
        } else {
          setUser({});
        }
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unlisten();

      if (listen) {
        listen();
      }
    };
  }, []);

  const login = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password);

  const logout = async () => {
    setUser(null);
    await signOut(auth);
  };

  const signInWithGoogle = () =>
    new Promise((resolve, reject) => {
      signInWithPopup(auth, provider)
        .then(async (result: any) => {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          const token = credential?.accessToken;
          const user = result.user;

          resolve(result);
          // ...
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          const email = error.customData.email;
          const credential = GoogleAuthProvider.credentialFromError(error);
          reject(error);
        });
    });

  const passwordReset = (email: string) => sendPasswordResetEmail(auth, email);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        signInWithGoogle,
        passwordReset,
      }}
    >
      {loading ? null : children}
    </AuthContext.Provider>
  );
};
