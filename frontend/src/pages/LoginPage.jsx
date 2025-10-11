import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
// import { fetchUserByCredentials } from "@/lib/mock";
import { authenticateUser } from "@/lib/api";
import { FcGoogle } from "react-icons/fc";


const google_auth_url = "http://localhost:8080/oauth2/authorization/google";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    console.log("login attempt", { email, password });

    try {
      const user = await authenticateUser({ email, password });
      if (user) {
        console.log("Logged in user:", user);
        navigate("/catalog");
      } else {
        alert("User not found");
      }
    } catch (err) {
      console.error(err.message);
      alert("Login failed");
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
            <span className="text-sm text-gray-700 dark:text-gray-300">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700 dark:text-gray-300">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </label>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Sign in
            </button>
            <Link to="/signup" className="text-sm text-indigo-600 hover:underline">
              Create account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
