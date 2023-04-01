import React, { useEffect } from "react";
import { useAuth } from "./AuthContext";
import { auth } from "./firebase";
import Glogo from "./Glogo";

export default function Popup() {
  const { user, login, logout, signInWithGoogle } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setErrors([]);

    if (!email || !password) {
      setLoading(false);
      return setErrors(["Provide username and password."]);
    }

    try {
      await login(email, password);
    } catch (e) {
      if (
        e.code === "auth/user-not-found" ||
        e.code === "auth/wrong-password"
      ) {
        setErrors(["Password or email is incorrect."]);
      } else if (e.code === "auth/popup-closed-by-user") {
        setErrors(["Popup closed"]);
      } else if (e.code === "auth/too-many-requests") {
        setErrors([
          "Account locked. Too many attempts. Try resetting your password.",
        ]);
      } else if (e.code === "auth/popup-closed-by-user") {
        // do nothing
      } else {
        setErrors([e.message]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignInWithGoogle = async () => {
    try {
      await signInWithGoogle();
      setLoading(true);
    } catch (e: any) {
      setLoading(false);
      setErrors([e.message]);
    }
  };

  return (
    <main className="p-3">
      <h1 className="text-3xl mb-9 text-center font-bold">ToobSquid</h1>

      {!user?.uid ? (
        <form action="" onSubmit={handleSubmit}>
          {errors.length > 0 &&
            errors.map((error) => (
              <p key={error} className="text-red-500 text-sm mb-2 mx-3">
                {error}
              </p>
            ))}
          <div className="mx-3">
            <button
              type="button"
              onClick={handleSignInWithGoogle}
              className="rounded-md mb-5 w-full md:text-lg flex items-center p-3 bg-neutral-800 hover:bg-neutral-900 hover:text-white"
            >
              <Glogo width={30} height={30} className="mr-3" />
              Sign in with Google
            </button>
          </div>

          <hr className="mb-5 border-violet-800" />

          <div className="mx-3">
            <div className="mb-3">
              <label className="mb-1 block" htmlFor="email">
                Email:
              </label>
              <input
                type="email"
                value={email}
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                className="text-sm md:text-base w-full block py-2 px-3 border-solid border-purple-400 border-2 bg-opacity-10 bg-purple-200 bg-purple rounded-md focus:outline-purple-900 hover:bg-purple-100 transition-all hover:bg-opacity-20"
              />
            </div>

            <div className="mb-3">
              <label className="mb-1 block" htmlFor="password">
                Password:
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-sm md:text-base w-full block py-2 px-3 border-solid border-purple-400 border-2 bg-opacity-10 bg-purple-200 bg-purple rounded-md focus:outline-purple-900 hover:bg-purple-100 transition-all hover:bg-opacity-20"
              />
            </div>

            <a
              href="/forgot-password"
              className="text-sm underline hover:no-underline"
            >
              Forgot password?
            </a>

            <button
              type="submit"
              className="relative md:text-base px-5 py-3 w-full rounded-md my-5 text-lg bg-violet-700 hover:bg-violet-900 transition-all bg-gradient-to-r from-light-blue-900"
            >
              {loading && (
                <div
                  style={{
                    background:
                      "url(https://tutorialspoint.com/svg/src/loaders/svg-loaders/oval.svg) no-repeat",
                    backgroundSize: "auto 30px",
                    width: 30,
                    height: 30,
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                ></div>
              )}

              <div style={{ opacity: loading ? 0 : 1 }}>Log in</div>
            </button>
          </div>
        </form>
      ) : (
        <div className="mx-3">
          <button
            type="button"
            className="relative md:text-base px-5 py-3 w-full rounded-md my-5 text-lg bg-violet-700 hover:bg-violet-900 transition-all bg-gradient-to-r from-light-blue-900"
            onClick={logout}
          >
            Log out
          </button>
        </div>
      )}
    </main>
  );
}
