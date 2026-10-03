export const CATEGORY_COLORS = {
  recommend: { hex: "#10B981", label: "Recommend", emoji: "👍" },
  avoid: { hex: "#EF4444", label: "Avoid", emoji: "👎" },
  safety_warning: { hex: "#F59E0B", label: "Warning", emoji: "⚠️" },
};

export const VENUE_EMOJIS = {
  hotel: "🏨",
  restaurant: "🍽️",
  bar: "🍸",
  cafe: "☕",
  museum: "🏛️",
  park: "🌳",
  beach: "🏖️",
  shopping: "🛍️",
  nightclub: "🎶",
  landmark: "🗿",
  temple: "⛩️",
  market: "🏪",
  spa: "💆",
  transport_hub: "🚉",
  viewpoint: "🌄",
  other: "📍",
};

export const TEXTURE_URLS = {
  satellite:
    "https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg",
  map: "https://unpkg.com/three-globe@2.31.1/example/img/earth-topology.png",
  bump: "https://unpkg.com/three-globe@2.31.1/example/img/earth-topology.png",
  clouds: "https://unpkg.com/three-globe@2.31.1/example/img/earth-water.png",
};

export const BOOKING_CAT_COLORS = {
  flights: { label: "Flights", emoji: "✈️", color: "#3B82F6" },
  hotels: { label: "Hotels", emoji: "🏨", color: "#8B5CF6" },
  activities: { label: "Activities", emoji: "🎫", color: "#10B981" },
  car_rental: { label: "Car Rental", emoji: "🚗", color: "#F59E0B" },
  insurance: { label: "Insurance", emoji: "🛡️", color: "#EF4444" },
  multi: { label: "Multi", emoji: "🌍", color: "#06B6D4" },
};

export const FILTER_OPTIONS = [
  { value: "all", label: "All Tips", color: "#3B82F6" },
  { value: "recommend", label: "👍 Recommend", color: "#10B981" },
  { value: "avoid", label: "👎 Avoid", color: "#EF4444" },
  { value: "safety_warning", label: "⚠️ Warnings", color: "#F59E0B" },
];
