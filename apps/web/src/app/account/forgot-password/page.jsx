import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resetUrl, setResetUrl] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResetUrl(null);

    if (!email) {
      setError("Please enter your email address");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Something went wrong");
      }

      const data = await response.json();
      setSubmitted(true);

      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        {!submitted ? (
          <>
            <h1 className="mb-2 text-center text-3xl font-bold text-gray-800">
              Forgot Password?
            </h1>
            <p className="mb-8 text-center text-gray-600">
              Enter your email and we'll help you reset it
            </p>

            <form noValidate onSubmit={onSubmit} className="space-y-5">
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
                {loading ? "Sending..." : "Reset Password"}
              </button>

              <p className="text-center text-sm text-gray-600">
                Remember your password?{" "}
                <a
                  href="/account/signin"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign in
                </a>
              </p>
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
              Check Your Email
            </h1>
            <p className="text-gray-600">
              If an account exists for <strong>{email}</strong>, you'll be able
              to reset your password.
            </p>

            {resetUrl && (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-gray-500">
                  Click the link below to reset your password:
                </p>
                <a
                  href={resetUrl}
                  className="block w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-4 text-lg font-semibold text-white transition-all hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg text-center"
                >
                  Reset My Password
                </a>
              </div>
            )}

            <div className="pt-2">
              <a
                href="/account/signin"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Back to Sign In
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
