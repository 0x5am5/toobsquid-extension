import React from "react";
import { AuthContextProvider } from "./AuthContext";
import { FirestoreContextProvider } from "./FirestoreContext";
import Popup from "./Popup";

import "./global.css";

export default function App() {
  return (
    <FirestoreContextProvider>
      <AuthContextProvider>
        <Popup />
      </AuthContextProvider>
    </FirestoreContextProvider>
  );
}
