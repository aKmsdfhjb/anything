import { useState } from "react";
import useAuth from "@/utils/useAuth";

export default function SignUpPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const { signUpWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password || !username) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      if (username) {
        localStorage.setItem("pendingUsername", username);
      }

      await signUpWithCredentials({
        email,
        password,
        callbackUrl: "/onboarding",
        redirect: true,
      });
    } catch (err) {
      const errorMessages = {
        OAuthSignin:
          "Couldn't start sign-up. Please try again or use a different method.",
        OAuthCallback: "Sign-up failed after redirecting. Please try again.",
        OAuthCreateAccount:
          "Couldn't create an account with this sign-up option. Try another one.",
        EmailCreateAccount:
          "This email can't be used. It may already be registered.",
        Callback: "Something went wrong during sign-up. Please try again.",
        OAuthAccountNotLinked:
          "This account is linked to a different sign-in method. Try using that instead.",
        CredentialsSignin:
          "Invalid email or password. If you already have an account, try signing in instead.",
        AccessDenied: "You don't have permission to sign up.",
        Configuration:
          "Sign-up isn't working right now. Please try again later.",
        Verification: "Your sign-up link has expired. Request a new one.",
      };

      setError(
        errorMessages[err.message] || "Something went wrong. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <form
        noValidate
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
      >
        <h1 className="mb-2 text-center text-4xl font-bold text-gray-800">
          Join Tip Trip
        </h1>
        <p className="mb-8 text-center text-gray-600">
          Share your travel wisdom with the world
        </p>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <div className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
              <input
                required
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                className="w-full bg-transparent text-lg outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
              <input
                required
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-transparent text-lg outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
              <input
                required
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-transparent text-lg outline-none"
                placeholder="Create a password"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-4 text-lg font-semibold text-white transition-all hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 shadow-lg"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href={`/account/signin${typeof window !== "undefined" ? window.location.search : ""}`}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign in
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
