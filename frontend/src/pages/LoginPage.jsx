import { use, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authenticateUser } from "@/lib/api";
import { FcGoogle } from "react-icons/fc";
import { Paper, Collapse } from "@mui/material";
import view from "../assets/view.png";
import hide from "../assets/hide.png";

const google_auth_url = "http://localhost:8080/oauth2/authorization/google";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [submittable] = useState(false);
  const [passwordShown, setPasswordShown] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await authenticateUser({ email, password });
      if (user) {
        navigate("/catalog");
      } else {
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = google_auth_url;
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 bg-white/80 dark:bg-slate-900/80 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100 text-center">
          Login
        </h2>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full mb-4 px-4 py-2 flex items-center justify-center gap-2
                     border border-gray-300 rounded-md shadow-sm
                     text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-100"
        >
          <FcGoogle className="h-5 w-5" />
          Sign in with Google
        </button>

        <div className="flex items-center space-x-2 my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="text-sm text-gray-500">or</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </label>

          <div>
            <label className="block">
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Password
                </span>
                <span>
                  <img
                    id="thebutton"
                    onClick={() => setPasswordShown((prev) => !prev)}
                    width={20}
                    height={20}
                    src={passwordShown ? hide : view}
                  />
                </span>
              </div>
              <input
                type={passwordShown ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                id="userEnteredPassword"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </label>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}

              {loading ? "Signing in..." : "Sign in"}
            </button>
            <Link
              to="/signup"
              className="text-sm text-indigo-600 hover:underline"
            >
              Create account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
