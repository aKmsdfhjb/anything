"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useUser from "@/utils/useUser";
import {
  Plane,
  Calendar,
  MapPin,
  Plus,
  FileText,
  Package,
  Share2,
  Globe,
  Check,
  ExternalLink,
  Copy,
  X,
  Sparkles,
  Filter,
  ChevronDown,
  Search,
} from "lucide-react";

export default function TripsPage() {
  const { data: user } = useUser();
  const queryClient = useQueryClient();
  const [shareModal, setShareModal] = useState(null);
  const [shareDescription, setShareDescription] = useState("");
  const [copiedCode, setCopiedCode] = useState(null);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    timeframe: "all",
    destination: "",
    ownership: "all",
    searchQuery: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["trips", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status !== "all") {
        params.append("status", filters.status);
      }
      const res = await fetch(`/api/trips?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch trips");
      return res.json();
    },
    enabled: !!user,
  });

  const allTrips = data?.trips || [];

  // Apply client-side filters
  const filteredTrips = allTrips.filter((trip) => {
    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const searchableText = [
        trip.trip_name,
        trip.destination_name,
        trip.country,
        trip.notes,
      ]
        .join(" ")
        .toLowerCase();
      if (!searchableText.includes(query)) return false;
    }

    // Timeframe filter
    if (filters.timeframe !== "all") {
      const now = new Date();
      const startDate = new Date(trip.start_date);
      const endDate = trip.end_date ? new Date(trip.end_date) : startDate;

      switch (filters.timeframe) {
        case "upcoming":
          if (startDate <= now) return false;
          break;
        case "past":
          if (endDate > now) return false;
          break;
        case "this-month":
          const thisMonth = now.getMonth();
          const thisYear = now.getFullYear();
          if (
            startDate.getMonth() !== thisMonth ||
            startDate.getFullYear() !== thisYear
          )
            return false;
          break;
        case "this-year":
          if (startDate.getFullYear() !== now.getFullYear()) return false;
          break;
      }
    }

    // Destination filter
    if (
      filters.destination &&
      !trip.destination_name
        .toLowerCase()
        .includes(filters.destination.toLowerCase())
    ) {
      return false;
    }

    // Ownership filter
    if (filters.ownership !== "all") {
      if (filters.ownership === "own" && trip.is_collaborator) return false;
      if (filters.ownership === "shared" && !trip.is_collaborator) return false;
    }

    return true;
  });

  const trips = filteredTrips;

  const clearFilters = () => {
    setFilters({
      status: "all",
      timeframe: "all",
      destination: "",
      ownership: "all",
      searchQuery: "",
    });
  };

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.timeframe !== "all" ||
    filters.destination ||
    filters.ownership !== "all" ||
    filters.searchQuery;

  const shareMutation = useMutation({
    mutationFn: async ({ trip_id, share_description }) => {
      const res = await fetch("/api/shared-trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trip_id, share_description }),
      });
      if (!res.ok) throw new Error("Failed to share");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      setShareModal(null);
      setShareDescription("");
    },
  });

  const handleShare = (trip) => {
    if (trip.is_public && trip.public_share_code) {
      // Already shared — just copy the link
      const url = `${window.location.origin}/shared-trip/${trip.public_share_code}`;
      navigator.clipboard.writeText(url);
      setCopiedCode(trip.id);
      setTimeout(() => setCopiedCode(null), 2000);
    } else {
      setShareModal(trip);
    }
  };

  const handlePublish = () => {
    if (!shareModal) return;
    shareMutation.mutate({
      trip_id: shareModal.id,
      share_description: shareDescription,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center">
        <div
          className="w-12 h-12 border-b-2 border-[#008C8F] rounded-full"
          style={{ animation: "spin 1s linear infinite" }}
        ></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F4F6F8]">
        <div className="bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] py-8">
          <div className="max-w-4xl mx-auto px-5">
            <h1 className="text-4xl font-black text-white mb-2">My Trips ✈️</h1>
            <p className="text-white opacity-90 font-semibold">
              Plan your adventures
            </p>
          </div>
        </div>
        <div className="max-w-md mx-auto px-5 py-20 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Sign in to plan your trips
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
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl md:text-5xl font-black text-white">
              My Trips ✈️
            </h1>
            <div className="flex items-center gap-2">
              <a
                href="/shared-trips"
                className="bg-white/25 p-3 rounded-xl hover:bg-white/40 transition-all"
                title="Community trips"
              >
                <Globe className="w-6 h-6 text-white" />
              </a>
              <button className="bg-white/25 p-3 rounded-xl hover:bg-white/40 transition-all">
                <Plus className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
          <p className="text-white opacity-90 font-semibold">
            {trips.length} {trips.length === 1 ? "trip" : "trips"} planned
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 md:px-8 py-8">
        {/* Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
          <div className="p-4">
            {/* Search and Filter Toggle */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search trips, destinations, notes..."
                  value={filters.searchQuery}
                  onChange={(e) =>
                    setFilters({ ...filters, searchQuery: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008C8F] focus:border-[#008C8F]"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                  hasActiveFilters
                    ? "bg-[#008C8F] text-white border-[#008C8F]"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                <Filter className="w-5 h-5" />
                <span className="font-semibold">
                  {hasActiveFilters ? "Filtered" : "Filter"}
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            {/* Active filter summary */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-600">Active filters:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {filters.status !== "all" && (
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                      Status: {filters.status}
                    </span>
                  )}
                  {filters.timeframe !== "all" && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                      Time: {filters.timeframe}
                    </span>
                  )}
                  {filters.destination && (
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">
                      Destination: {filters.destination}
                    </span>
                  )}
                  {filters.ownership !== "all" && (
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-semibold">
                      Type: {filters.ownership}
                    </span>
                  )}
                  <button
                    onClick={clearFilters}
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Expanded Filter Panel */}
          {showFilters && (
            <div className="border-t border-gray-100 p-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008C8F]"
                  >
                    <option value="all">All Status</option>
                    <option value="planned">Planned</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Timeframe Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Timeframe
                  </label>
                  <select
                    value={filters.timeframe}
                    onChange={(e) =>
                      setFilters({ ...filters, timeframe: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008C8F]"
                  >
                    <option value="all">All Time</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="past">Past</option>
                    <option value="this-month">This Month</option>
                    <option value="this-year">This Year</option>
                  </select>
                </div>

                {/* Destination Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Destination
                  </label>
                  <input
                    type="text"
                    placeholder="Filter by destination..."
                    value={filters.destination}
                    onChange={(e) =>
                      setFilters({ ...filters, destination: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008C8F]"
                  />
                </div>

                {/* Ownership Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Trip Type
                  </label>
                  <select
                    value={filters.ownership}
                    onChange={(e) =>
                      setFilters({ ...filters, ownership: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008C8F]"
                  >
                    <option value="all">All Trips</option>
                    <option value="own">My Trips</option>
                    <option value="shared">Shared with Me</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        {hasActiveFilters && (
          <div className="mb-6 text-center">
            <p className="text-gray-600">
              Showing{" "}
              <span className="font-bold text-[#008C8F]">{trips.length}</span>{" "}
              of <span className="font-bold">{allTrips.length}</span> trips
            </p>
          </div>
        )}

        {trips.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
            <div className="text-6xl mb-6">✈️</div>
            <h2 className="text-2xl font-black text-gray-900 mb-3">
              {hasActiveFilters
                ? "No trips match your filters"
                : "No trips yet!"}
            </h2>
            <p className="text-gray-600 mb-8">
              {hasActiveFilters
                ? "Try adjusting your search or filters"
                : "Start planning your next adventure"}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg transition-all"
              >
                Clear Filters
              </button>
            ) : (
              <button className="bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg transition-all">
                Plan Your First Trip
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {trips.map((trip) => {
              const startDate = new Date(trip.start_date);
              const endDate = trip.end_date ? new Date(trip.end_date) : null;
              const now = new Date();
              const daysUntil = Math.ceil(
                (startDate - now) / (1000 * 60 * 60 * 24),
              );
              const isUpcoming = daysUntil > 0;
              const isCompleted = trip.status === "completed";
              const isCopied = copiedCode === trip.id;

              return (
                <div
                  key={trip.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-2xl font-black text-white mb-2">
                          {trip.trip_name}
                        </h3>
                        <div className="flex items-center gap-2 text-white opacity-90">
                          <MapPin className="w-4 h-4" />
                          <span className="font-semibold">
                            {trip.destination_name}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isCompleted && (
                          <button
                            onClick={() => handleShare(trip)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                              trip.is_public
                                ? "bg-green-400/30 text-white"
                                : "bg-white/25 text-white hover:bg-white/40"
                            }`}
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-4 h-4" /> Copied!
                              </>
                            ) : trip.is_public ? (
                              <>
                                <Check className="w-4 h-4" /> Shared
                              </>
                            ) : (
                              <>
                                <Share2 className="w-4 h-4" /> Share Trip
                              </>
                            )}
                          </button>
                        )}
                        {isUpcoming && (
                          <div className="bg-white/25 px-4 py-2 rounded-xl">
                            <p className="text-white text-xs font-bold">
                              {daysUntil} {daysUntil === 1 ? "day" : "days"}
                            </p>
                            <p className="text-white text-xs opacity-90">
                              to go!
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-xl">
                        <Calendar className="w-4 h-4 text-white" />
                        <span className="text-sm text-white font-semibold">
                          {startDate.toLocaleDateString()}
                        </span>
                      </div>
                      {endDate && (
                        <>
                          <span className="text-white">→</span>
                          <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-xl">
                            <span className="text-sm text-white font-semibold">
                              {endDate.toLocaleDateString()}
                            </span>
                          </div>
                        </>
                      )}
                      {isCompleted && (
                        <span className="bg-green-400/30 text-white px-3 py-2 rounded-xl text-xs font-bold">
                          ✓ Completed
                        </span>
                      )}
                    </div>

                    {/* Share link if public */}
                    {trip.is_public && trip.public_share_code && (
                      <div className="mt-3 flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl">
                        <ExternalLink className="w-3.5 h-3.5 text-white/70" />
                        <span className="text-xs text-white/70 font-semibold truncate flex-1">
                          /shared-trip/{trip.public_share_code}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(trip);
                          }}
                          className="text-xs text-white font-bold bg-white/20 px-2 py-1 rounded-lg"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    {trip.notes && (
                      <p className="text-gray-700 mb-6 leading-relaxed">
                        {trip.notes}
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <button className="flex items-center justify-center gap-2 bg-gray-100 py-3 rounded-xl hover:bg-gray-200 transition-all">
                        <FileText className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-bold text-gray-900">
                          Documents
                        </span>
                      </button>
                      <button className="flex items-center justify-center gap-2 bg-gray-100 py-3 rounded-xl hover:bg-gray-200 transition-all">
                        <Package className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-bold text-gray-900">
                          Packing
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Share Modal */}
      {shareModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-5">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#008C8F]" />
                <h2 className="text-xl font-black text-gray-900">
                  Share Your Trip
                </h2>
              </div>
              <button
                onClick={() => setShareModal(null)}
                className="p-2 hover:bg-gray-100 rounded-xl"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <p className="text-gray-600 text-sm mb-4">
              Share <strong>{shareModal.trip_name}</strong> with the community.
              Others can view your full itinerary, copy it, and book the same
              trip.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Add a note for travelers (optional)
              </label>
              <textarea
                value={shareDescription}
                onChange={(e) => setShareDescription(e.target.value)}
                placeholder="Tell people what made this trip special..."
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#008C8F] resize-none"
                rows={3}
              />
            </div>

            <button
              onClick={handlePublish}
              disabled={shareMutation.isPending}
              className="w-full bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] text-white py-3.5 rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {shareMutation.isPending
                ? "Publishing..."
                : "Share with Community 🚀"}
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
