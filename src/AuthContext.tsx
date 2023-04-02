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
  signInWithCredential,
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
        console.log(authUser);

        chrome.runtime.sendMessage(
          {
            message: authUser?.uid ? "user_logged_in" : "user_logged_out",
            payload: {
              userID: authUser?.uid,
              tester: authUser?.tester,
              openAIKey: authUser?.openAIKey,
            },
          },
          (response) => {
            console.log(response);
          }
        );
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
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError || !token) {
          alert(
            `SSO ended with an error: ${JSON.stringify(
              chrome.runtime.lastError
            )}`
          );
          return;
        }

        signInWithCredential(auth, GoogleAuthProvider.credential(null, token))
          .then((res) => {
            resolve("signed in!");
          })
          .catch((err) => {
            reject(err);
          });
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
