"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useUser from "@/utils/useUser";
import {
  MapPin,
  Calendar,
  Clock,
  ArrowLeft,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Plane,
  Hotel,
  Ticket,
  Car,
  Shield,
  Globe,
  User,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  Utensils,
  Bus,
  Bed,
  Eye,
  ShoppingBag,
  Moon,
  Package,
  Rocket,
} from "lucide-react";

const CATEGORY_CONFIG = {
  flights: { label: "Flights", emoji: "✈️", color: "#3B82F6", icon: Plane },
  hotels: { label: "Hotels", emoji: "🏨", color: "#8B5CF6", icon: Hotel },
  activities: {
    label: "Activities",
    emoji: "🎫",
    color: "#10B981",
    icon: Ticket,
  },
  car_rental: { label: "Car Rental", emoji: "🚗", color: "#F59E0B", icon: Car },
  insurance: { label: "Insurance", emoji: "🛡️", color: "#EF4444", icon: Shield },
  multi: { label: "Multi-Service", emoji: "🌍", color: "#06B6D4", icon: Globe },
};

const ITEM_ICONS = {
  activity: { icon: Ticket, color: "#10B981" },
  food: { icon: Utensils, color: "#F59E0B" },
  transport: { icon: Bus, color: "#3B82F6" },
  accommodation: { icon: Bed, color: "#8B5CF6" },
  sightseeing: { icon: Eye, color: "#EC4899" },
  shopping: { icon: ShoppingBag, color: "#F97316" },
  nightlife: { icon: Moon, color: "#6366F1" },
  other: { icon: Package, color: "#64748B" },
};

export default function SharedTripPage(props) {
  const code = props.params.code;
  const { data: user } = useUser();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [expandedDay, setExpandedDay] = useState(null);
  const [cloneSuccess, setCloneSuccess] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["shared-trip", code],
    queryFn: async () => {
      const res = await fetch(`/api/shared-trips?code=${code}`);
      if (!res.ok) throw new Error("Trip not found");
      return res.json();
    },
  });

  const cloneMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/shared-trips", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ share_code: code }),
      });
      if (!res.ok) throw new Error("Failed to clone trip");
      return res.json();
    },
    onSuccess: () => {
      setCloneSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });

  const trip = data?.trip;
  const items = data?.items || [];
  const affiliateLinks = data?.affiliateLinks || [];

  // Group items by day
  const dayGroups = useMemo(() => {
    const groups = {};
    items.forEach((item) => {
      if (!groups[item.day_number]) groups[item.day_number] = [];
      groups[item.day_number].push(item);
    });
    return groups;
  }, [items]);

  const dayNumbers = Object.keys(dayGroups).sort((a, b) => a - b);

  // Group affiliate links by category
  const groupedLinks = useMemo(() => {
    const grouped = {};
    affiliateLinks.forEach((link) => {
      if (!grouped[link.category]) grouped[link.category] = [];
      grouped[link.category].push(link);
    });
    return grouped;
  }, [affiliateLinks]);

  // Open multiple booking tabs for the trip
  const handleBookEntireTrip = () => {
    // Open one link per category (the top-rated partner in each)
    const categoriesToOpen = ["flights", "hotels", "activities", "insurance"];
    const linksToOpen = [];

    categoriesToOpen.forEach((cat) => {
      const catLinks = groupedLinks[cat];
      if (catLinks && catLinks.length > 0) {
        linksToOpen.push(catLinks[0]);
      }
    });

    // Also open any activity-specific links for itinerary items
    const activityLinks = groupedLinks["activities"] || [];
    if (activityLinks.length > 1) {
      linksToOpen.push(activityLinks[1]);
    }
    const carLinks = groupedLinks["car_rental"] || [];
    if (carLinks.length > 0) {
      linksToOpen.push(carLinks[0]);
    }

    linksToOpen.forEach((link, i) => {
      setTimeout(() => {
        window.open(link.booking_url, "_blank", "noopener,noreferrer");
      }, i * 300);
    });
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008C8F]"></div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">
            Trip not found
          </h1>
          <p className="text-gray-600 mb-6">
            This trip may have been removed or isn't shared publicly.
          </p>
          <a
            href="/shared-trips"
            className="bg-[#008C8F] text-white px-6 py-3 rounded-xl font-bold"
          >
            Browse Community Trips
          </a>
        </div>
      </div>
    );
  }

  const startDate = new Date(trip.start_date);
  const endDate = trip.end_date ? new Date(trip.end_date) : null;
  const tripDays = endDate
    ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
    : dayNumbers.length;

  return (
    <div className="min-h-screen bg-[#F4F6F8] pb-20 md:pb-8">
      {/* Hero */}
      <div className="relative">
        {trip.image_url && (
          <div className="h-72 md:h-96 relative">
            <img
              src={trip.image_url}
              alt={trip.destination_name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          </div>
        )}
        <div
          className={`${trip.image_url ? "absolute bottom-0 left-0 right-0" : "bg-gradient-to-r from-[#008C8F] to-[#7DE2D1]"} p-6 md:p-8`}
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <a
                href="/shared-trips"
                className="bg-white/20 p-2 rounded-xl hover:bg-white/30 backdrop-blur-sm"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </a>
              <span className="bg-[#008C8F] text-white text-xs font-bold px-3 py-1 rounded-full">
                SHARED ITINERARY
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-2">
              {trip.trip_name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/90">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span className="font-semibold">
                  {trip.destination_name}, {trip.country}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span className="font-semibold">
                  {startDate.toLocaleDateString()}{" "}
                  {endDate && `→ ${endDate.toLocaleDateString()}`}
                </span>
              </div>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                {tripDays} {tripDays === 1 ? "day" : "days"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 md:px-8 py-8">
        {/* Author & Actions Bar */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            {trip.profile_image ? (
              <img
                src={trip.profile_image}
                alt={trip.username}
                className="w-12 h-12 rounded-full border-2 border-[#008C8F]"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {trip.username?.[0]?.toUpperCase() || "?"}
                </span>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">
                  {trip.username || "Traveler"}
                </span>
                {trip.is_verified && (
                  <BadgeCheck className="w-4 h-4 text-blue-500" />
                )}
              </div>
              <p className="text-sm text-gray-500">
                Shared their trip experience
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 bg-gray-100 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-200 transition-all"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "Copied!" : "Share Link"}
            </button>
            {user && !cloneSuccess && (
              <button
                onClick={() => cloneMutation.mutate()}
                disabled={cloneMutation.isPending}
                className="flex items-center gap-2 bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50"
              >
                <Rocket className="w-4 h-4" />
                {cloneMutation.isPending ? "Copying..." : "Copy to My Trips"}
              </button>
            )}
            {cloneSuccess && (
              <span className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2.5 rounded-xl text-sm font-bold">
                <Check className="w-4 h-4" />
                Added to your trips!
              </span>
            )}
            {!user && (
              <a
                href="/account/signin"
                className="flex items-center gap-2 bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] text-white px-4 py-2.5 rounded-xl text-sm font-bold"
              >
                <User className="w-4 h-4" />
                Sign in to copy
              </a>
            )}
          </div>
        </div>

        {/* Description */}
        {(trip.share_description || trip.notes) && (
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
            <p className="text-gray-700 leading-relaxed">
              {trip.share_description || trip.notes}
            </p>
          </div>
        )}

        {/* Book This Entire Trip */}
        {affiliateLinks.length > 0 && (
          <div className="bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] rounded-2xl p-6 mb-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6" />
              <h2 className="text-xl font-black">Book This Entire Trip</h2>
            </div>
            <p className="text-white/80 text-sm mb-5">
              Opens booking tabs for flights, hotels, activities, car rental &
              insurance — all pre-filled for {trip.destination_name}.
            </p>
            <button
              onClick={handleBookEntireTrip}
              className="bg-white text-[#008C8F] px-8 py-3.5 rounded-xl font-black text-lg hover:shadow-lg transition-all flex items-center gap-3"
            >
              <Rocket className="w-5 h-5" />
              Open All Booking Tabs
            </button>

            {/* Individual partner links */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(groupedLinks).map(([cat, links]) => {
                const config = CATEGORY_CONFIG[cat] || {
                  label: cat,
                  emoji: "📍",
                  color: "#fff",
                };
                return (
                  <div key={cat}>
                    <p className="text-xs font-bold text-white/60 mb-1.5">
                      {config.emoji} {config.label}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {links.map((link) => (
                        <a
                          key={link.id}
                          href={link.booking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all backdrop-blur-sm"
                        >
                          {link.partner_name}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Day-by-Day Itinerary */}
        <div className="mb-6">
          <h2 className="text-2xl font-black text-gray-900 mb-4">
            📋 Day-by-Day Itinerary
          </h2>

          {dayNumbers.length === 0 && (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <p className="text-gray-500">
                No itinerary items have been added to this trip yet.
              </p>
            </div>
          )}

          {dayNumbers.map((dayNum) => {
            const dayItems = dayGroups[dayNum];
            const isExpanded =
              expandedDay === null || expandedDay === parseInt(dayNum);
            const dayDate = new Date(startDate);
            dayDate.setDate(dayDate.getDate() + parseInt(dayNum) - 1);

            return (
              <div
                key={dayNum}
                className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedDay(
                      expandedDay === parseInt(dayNum) ? -1 : parseInt(dayNum),
                    )
                  }
                  className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#008C8F] to-[#7DE2D1] flex items-center justify-center">
                      <span className="text-white font-black text-sm">
                        {dayNum}
                      </span>
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-gray-900">Day {dayNum}</h3>
                      <p className="text-xs text-gray-500">
                        {dayDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        • {dayItems.length}{" "}
                        {dayItems.length === 1 ? "item" : "items"}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 pb-5">
                    {dayItems.map((item, idx) => {
                      const itemConfig =
                        ITEM_ICONS[item.category] || ITEM_ICONS.other;
                      const IconComponent = itemConfig.icon;

                      // Find relevant affiliate link for this item's category
                      let bookLink = null;
                      if (item.category === "accommodation")
                        bookLink = (groupedLinks.hotels || [])[0];
                      else if (item.category === "transport")
                        bookLink = (groupedLinks.flights || [])[0];
                      else if (
                        item.category === "activity" ||
                        item.category === "sightseeing"
                      )
                        bookLink = (groupedLinks.activities || [])[0];
                      else if (item.category === "food")
                        bookLink =
                          (groupedLinks.activities || [])[1] ||
                          (groupedLinks.multi || [])[0];

                      return (
                        <div
                          key={item.id}
                          className="flex gap-4 py-4 border-b border-gray-50 last:border-0"
                        >
                          <div className="flex flex-col items-center">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center"
                              style={{
                                backgroundColor: itemConfig.color + "15",
                              }}
                            >
                              <IconComponent
                                className="w-4 h-4"
                                style={{ color: itemConfig.color }}
                              />
                            </div>
                            {idx < dayItems.length - 1 && (
                              <div className="w-0.5 flex-1 bg-gray-100 mt-2" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900">
                                  {item.title}
                                </h4>
                                {item.start_time && (
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <Clock className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-500 font-semibold">
                                      {item.start_time}
                                      {item.end_time && ` - ${item.end_time}`}
                                    </span>
                                  </div>
                                )}
                                {item.location_name && (
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <MapPin className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">
                                      {item.location_name}
                                    </span>
                                  </div>
                                )}
                                {item.description && (
                                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                              {bookLink && (
                                <a
                                  href={bookLink.booking_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="shrink-0 flex items-center gap-1 bg-[#008C8F]/10 text-[#008C8F] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#008C8F]/20 transition-all"
                                >
                                  Book <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
