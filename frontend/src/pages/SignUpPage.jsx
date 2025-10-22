import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "@/lib/api"; // your user registration logic
import view from "../assets/view.png";
import hide from "../assets/hide.png";
import { Paper, Collapse } from "@mui/material";

export default function SignUpPage() {
  const [full_name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordShown, setPasswordShown] = useState(false);
  const [visible, setVisible] = useState(false);

  const [checks, setChecks] = useState({
    lengthCheck: false,
    capitalLetterCheck: false,
    numberCheck: false,
    noSpaceCheck: true,
  });

  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    console.log("signup attempt", { full_name, email, password });

    try {
      const user = await registerUser({ full_name, email, password });
      if (user) {
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

  function checkPassword(pw) {
    const newChecks = {
      lengthCheck: pw.length >= 8 && pw.length < 20,
      capitalLetterCheck: /[A-Z]/.test(pw),
      numberCheck: /\d/.test(pw),
      noSpaceCheck: !pw.includes(" "),
    };
    setChecks(newChecks);
    const anyFail = Object.values(newChecks).some((c) => !c);
    setVisible(anyFail);
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md p-8 bg-white/80 dark:bg-slate-900/80 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100 text-center">
          Create Account
        </h2>

        <form onSubmit={submit} className="space-y-4">
          {/* Full Name */}
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

          {/* Email */}
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

          {/* Password */}
          <div>
            <label className="block">
              <div className="flex justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Password
                </span>
                <img
                  onClick={() => setPasswordShown((prev) => !prev)}
                  width={20}
                  height={20}
                  src={passwordShown ? hide : view}
                  alt="toggle visibility"
                  className="cursor-pointer"
                />
              </div>
              <input
                type={passwordShown ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  checkPassword(e.target.value);
                }}
                onBlur={() => setVisible(false)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </label>

            {/* Animated password rule collapse */}
            <Collapse in={visible}>
              <Paper
                className="w-full max-w-sm"
                sx={{
                  marginTop: 2,
                  padding: 1.5,
                  zIndex: 1300,
                }}
              >
                <div className="flex flex-col items-center space-y-1">
                  <p
                    className={
                      checks.lengthCheck ? "text-green-600" : "text-red-600"
                    }
                  >
                    8–20 characters
                  </p>
                  <p
                    className={
                      checks.capitalLetterCheck
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    At least one capital letter
                  </p>
                  <p
                    className={
                      checks.numberCheck ? "text-green-600" : "text-red-600"
                    }
                  >
                    At least one number
                  </p>
                  <p
                    className={
                      checks.noSpaceCheck ? "text-green-600" : "text-red-600"
                    }
                  >
                    No spaces
                  </p>
                </div>
              </Paper>
            </Collapse>
          </div>

          {/* Submit + Login link */}
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
