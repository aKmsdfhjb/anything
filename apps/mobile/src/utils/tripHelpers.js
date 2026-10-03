export function calculateCountdown(tripStartDate) {
  const now = new Date();
  const tripDate = new Date(tripStartDate);
  const diffTime = tripDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0)
    return { text: "Trip has started or passed", isUpcoming: false };
  if (diffDays === 0) return { text: "Today! 🎉", isUpcoming: true, days: 0 };
  if (diffDays === 1)
    return { text: "Tomorrow! 🎉", isUpcoming: true, days: 1 };
  return { text: `${diffDays} days`, isUpcoming: true, days: diffDays };
}
