import { useState, useEffect } from "react";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get("token");
      if (urlToken) {
        setToken(urlToken);
      }
    }
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!password || !confirmPassword) {
      setError("Please fill in both password fields");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    if (!token) {
      setError("Invalid reset link. Please request a new one.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl text-center space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Invalid Reset Link
          </h1>
          <p className="text-gray-600">
            This password reset link is missing or invalid. Please request a new
            one.
          </p>
          <a
            href="/account/forgot-password"
            className="block w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-4 text-lg font-semibold text-white transition-all hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg text-center"
          >
            Request New Link
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        {!success ? (
          <>
            <h1 className="mb-2 text-center text-3xl font-bold text-gray-800">
              Set New Password
            </h1>
            <p className="mb-8 text-center text-gray-600">
              Enter your new password below
            </p>

            <form noValidate onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
                  <input
                    required
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-transparent text-lg outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
                  <input
                    required
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full bg-transparent text-lg outline-none"
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
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-800">
              Password Reset!
            </h1>
            <p className="text-gray-600">
              Your password has been changed successfully. You can now sign in
              with your new password.
            </p>

            <a
              href="/account/signin"
              className="block w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-4 text-lg font-semibold text-white transition-all hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg text-center"
            >
              Sign In
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
