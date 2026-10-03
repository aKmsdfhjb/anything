"use client";

import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import { Heart, MapPin, Trash2 } from "lucide-react";

export default function SavedPage() {
  const { data: user } = useUser();
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSavedPlaces();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchSavedPlaces = async () => {
    try {
      const response = await fetch("/api/saved-places");
      if (!response.ok) throw new Error("Failed to fetch saved places");
      const data = await response.json();
      setSavedPlaces(data.places || []);
    } catch (error) {
      console.error("Error fetching saved places:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (placeId) => {
    if (!confirm("Remove this place from your saved list?")) return;

    try {
      const response = await fetch("/api/saved-places", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination_id: placeId }),
      });

      if (!response.ok) throw new Error("Failed to remove place");
      fetchSavedPlaces();
    } catch (error) {
      console.error("Error removing place:", error);
      alert("Could not remove place");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008C8F]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] py-8">
          <div className="max-w-4xl mx-auto px-5">
            <h1 className="text-4xl font-black text-white mb-2">
              Saved Places 💖
            </h1>
            <p className="text-white opacity-90 font-semibold">
              Your dream destinations
            </p>
          </div>
        </div>
        <div className="max-w-md mx-auto px-5 py-20 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Sign in to save your favorite places
          </h2>
          <a
            href="/account/signin"
            className="inline-block bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] pb-20 md:pb-8">
      <div className="bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] py-8">
        <div className="max-w-4xl mx-auto px-5 md:px-8">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
            Saved Places 💖
          </h1>
          <p className="text-white opacity-90 font-semibold">
            {savedPlaces.length} {savedPlaces.length === 1 ? "place" : "places"}{" "}
            saved
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 md:px-8 py-8">
        {savedPlaces.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
            <div className="text-6xl mb-6">💖</div>
            <h2 className="text-2xl font-black text-gray-900 mb-3">
              No saved places yet!
            </h2>
            <p className="text-gray-600 mb-8">
              Start exploring and save your favorite destinations
            </p>
            <a
              href="/"
              className="inline-block bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg transition-all"
            >
              Explore Destinations
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedPlaces.map((place) => (
              <div
                key={place.id}
                className="bg-white border-2 border-gray-100 rounded-3xl overflow-hidden hover:border-[#7DE2D1] hover:shadow-xl transition-all"
              >
                {place.image_url && (
                  <img
                    src={place.image_url}
                    alt={place.name}
                    className="w-full h-48 object-cover"
                  />
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-gray-900 mb-2">
                        {place.name}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 text-[#008C8F]" />
                        <span className="text-sm font-semibold">
                          {place.country}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemove(place.destination_id)}
                      className="bg-red-50 p-2 rounded-xl hover:bg-red-100 transition-all"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>

                  {place.description && (
                    <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3">
                      {place.description}
                    </p>
                  )}

                  {place.notes && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                      <p className="text-sm text-yellow-900 font-semibold">
                        My Notes:
                      </p>
                      <p className="text-sm text-yellow-800">{place.notes}</p>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Saved on {new Date(place.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
