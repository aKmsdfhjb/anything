export function getCountdown(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  if (diff <= 0) return { expired: true };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    expired: false,
  };
}

export function getUpcomingTrips(trips) {
  return trips.filter(
    (t) =>
      new Date(t.start_date) > new Date() &&
      (t.status === "planned" || t.status === "upcoming"),
  );
}

export function getCountdownTrip(profile) {
  if (!profile?.countdown_trip_name) return null;

  return {
    name: profile.countdown_trip_name,
    start_date: profile.countdown_start_date,
    destination: profile.countdown_destination_name,
    country: profile.countdown_country,
  };
}

export function renderAvatar(imgUrl, name, size = "w-10 h-10") {
  if (imgUrl)
    return (
      <img
        src={imgUrl}
        alt=""
        className={`${size} rounded-full object-cover`}
      />
    );
  return (
    <div
      className={`${size} rounded-full bg-gradient-to-br from-[#008C8F] to-[#7DE2D1] flex items-center justify-center`}
    >
      <span className="text-white font-bold text-sm">
        {name?.[0]?.toUpperCase() || "?"}
      </span>
    </div>
  );
}
