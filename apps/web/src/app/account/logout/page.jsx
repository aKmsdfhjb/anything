import useAuth from "@/utils/useAuth";

export default function LogoutPage() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/",
      redirect: true,
    });
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <h1 className="mb-2 text-center text-4xl font-bold text-gray-800">
          Sign Out
        </h1>
        <p className="mb-8 text-center text-gray-600">Come back soon!</p>

        <button
          onClick={handleSignOut}
          className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-4 text-lg font-semibold text-white transition-all hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
