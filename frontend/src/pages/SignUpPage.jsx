import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "@/lib/api"; // Import localStorage-based users

export default function SignUpPage() {
  const [full_name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    console.log("signup attempt", { full_name, email, password });

    try {
      const user = await registerUser({ full_name, email, password });
      if (user) {
        console.log("Signed up user:", user);
        alert("Account created successfully! Please login.");
        navigate("/");
      } else {
        alert("Username already taken");
      }
    } catch (err) {
      console.error(err.message);
      alert("Signup failed");
    }
  }

  function checkPassword(password) {
    let lengthCheck = false;
    let numberCheck = false;
    let noSpaceCheck = false;
    let capitalLetterCheck = false;
    if (password.length >= 8 && password.length < 20) {
      performCheck("lengthCheck", "green");
      lengthCheck = true;
    } else {
      performCheck("lengthCheck", "red");
      lengthCheck = false;
    }
    if (/[A-Z]+/.test(password)) {
      performCheck("capitalLetterCheck", "green");
      capitalLetterCheck = true;
    } else {
      performCheck("capitalLetterCheck", "red");
      capitalLetterCheck = false;
    }
    if (/\d+/.test(password)) {
      performCheck("numberCheck", "green");
      numberCheck = true;
    } else {
      performCheck("numberCheck", "red");
      numberCheck = false;
    }
    if (password.includes(" ")) {
      if (document.getElementById("noSpaceCheck").style.display == "none") {
        document.getElementById("noSpaceCheck").style.display = "block";
      }
      performCheck("noSpaceCheck", "red");
      noSpaceCheck = false;
    } else {
      performCheck("noSpaceCheck", "green");
      noSpaceCheck = true;
    }
    if (lengthCheck && numberCheck && noSpaceCheck && capitalLetterCheck) {
      setSubmittable(true);
      setTimeout(() => {
        setVisible(false);
      }, 200);
    } else {
      setSubmittable(false);
      setVisible(true);
    }
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md p-8 bg-white/80 dark:bg-slate-900/80 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100 text-center">
          Create Account
        </h2>
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Full name
            </span>
            <input
              type="text"
              value={full_name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </label>

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

          <label className="block">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onInput={(e) => checkPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </label>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="w-max px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Create account
            </button>
            <Link
              to="/login"
              className="text-sm text-indigo-600 hover:underline"
            >
              Already have an account?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
