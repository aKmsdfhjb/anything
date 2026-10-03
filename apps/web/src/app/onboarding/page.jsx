import { useState, useCallback, useEffect } from "react";
import useUser from "@/utils/useUser";

export default function OnboardingPage() {
  const { data: user, loading: userLoading } = useUser();
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pendingUsername = localStorage.getItem("pendingUsername");
      if (pendingUsername && !username) {
        setUsername(pendingUsername);
      }
    }
  }, [username]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setSaving(true);
      setError(null);

      try {
        const res = await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, bio }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to create profile");
        }

        if (typeof window !== "undefined") {
          localStorage.removeItem("pendingUsername");
          window.location.href = "/";
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
        setSaving(false);
      }
    },
    [username, bio],
  );

  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
      >
        <h1 className="mb-2 text-center text-4xl font-bold text-gray-800">
          Complete Your Profile
        </h1>
        <p className="mb-8 text-center text-gray-600">
          Tell us a bit about yourself
        </p>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <div className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
              <input
                required
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
              Bio (Optional)
            </label>
            <div className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about your travel experiences..."
                rows={4}
                className="w-full bg-transparent text-lg outline-none resize-none"
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
            disabled={saving || !username}
            className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-4 text-lg font-semibold text-white transition-all hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 shadow-lg"
          >
            {saving ? "Saving..." : "Complete Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
