"use client";

import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  Calendar,
  User,
  BadgeCheck,
  ArrowRight,
  Sparkles,
  Plane,
} from "lucide-react";

export default function SharedTripsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["shared-trips"],
    queryFn: async () => {
      const res = await fetch("/api/shared-trips");
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
  });

  const trips = data?.trips || [];

  return (
    <div className="min-h-screen bg-[#F4F6F8] pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] px-5 md:px-8 py-8 rounded-b-[2rem]">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-white" />
            <h1 className="text-4xl md:text-5xl font-black text-white">
              Community Trips
            </h1>
          </div>
          <p className="text-white/90 font-semibold">
            Real itineraries from real travelers — copy any trip and make it
            your own
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 md:px-8 py-8">
        {isLoading && (
          <div className="flex justify-center py-20">
            <div
              className="w-10 h-10 border-b-2 border-[#008C8F] rounded-full"
              style={{ animation: "spin 1s linear infinite" }}
            ></div>
          </div>
        )}

        {!isLoading && trips.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
            <div className="text-6xl mb-6">🌍</div>
            <h2 className="text-2xl font-black text-gray-900 mb-3">
              No shared trips yet
            </h2>
            <p className="text-gray-600 mb-6">
              Be the first to share your completed trip with the community!
            </p>
            <a
              href="/trips"
              className="bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] text-white px-8 py-3 rounded-xl font-bold inline-block"
            >
              Go to My Trips
            </a>
          </div>
        )}

        <div className="space-y-6">
          {trips.map((trip) => {
            const startDate = new Date(trip.start_date);
            const endDate = trip.end_date ? new Date(trip.end_date) : null;

            return (
              <a
                key={trip.id}
                href={`/shared-trip/${trip.public_share_code}`}
                className="block bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all group"
              >
                {trip.image_url && (
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src={trip.image_url}
                      alt={trip.destination_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-2xl font-black text-white">
                        {trip.trip_name}
                      </h3>
                      <div className="flex items-center gap-2 text-white/90 mt-1">
                        <MapPin className="w-4 h-4" />
                        <span className="font-semibold text-sm">
                          {trip.destination_name}, {trip.country}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {!trip.image_url && (
                  <div className="bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] p-6">
                    <h3 className="text-2xl font-black text-white">
                      {trip.trip_name}
                    </h3>
                    <div className="flex items-center gap-2 text-white/90 mt-1">
                      <MapPin className="w-4 h-4" />
                      <span className="font-semibold text-sm">
                        {trip.destination_name}, {trip.country}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {trip.profile_image ? (
                        <img
                          src={trip.profile_image}
                          alt={trip.username}
                          className="w-10 h-10 rounded-full border-2 border-[#008C8F]"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] flex items-center justify-center">
                          <span className="text-white font-bold">
                            {trip.username?.[0]?.toUpperCase() || "?"}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-gray-900 text-sm">
                            {trip.username || "Traveler"}
                          </span>
                          {trip.is_verified && (
                            <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[#008C8F] font-bold text-sm group-hover:gap-3 transition-all">
                      View Trip <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                  {trip.share_description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {trip.share_description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg">
                      <Calendar className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-xs font-semibold text-gray-700">
                        {startDate.toLocaleDateString()}
                        {endDate && ` → ${endDate.toLocaleDateString()}`}
                      </span>
                    </div>
                    {parseInt(trip.day_count) > 0 && (
                      <span className="bg-[#008C8F]/10 text-[#008C8F] px-3 py-1.5 rounded-lg text-xs font-bold">
                        {trip.day_count} days
                      </span>
                    )}
                    {parseInt(trip.item_count) > 0 && (
                      <span className="bg-[#7DE2D1]/20 text-[#008C8F] px-3 py-1.5 rounded-lg text-xs font-bold">
                        {trip.item_count} activities
                      </span>
                    )}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
