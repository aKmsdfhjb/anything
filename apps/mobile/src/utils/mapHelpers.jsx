import {
  UtensilsCrossed,
  Hotel,
  Car,
  Compass,
  MapPin,
} from "lucide-react-native";

export const getCategoryIcon = (category) => {
  switch (category) {
    case "food":
      return <UtensilsCrossed color="#fff" size={18} />;
    case "hotel":
      return <Hotel color="#fff" size={18} />;
    case "transport":
      return <Car color="#fff" size={18} />;
    case "excursion":
      return <Compass color="#fff" size={18} />;
    default:
      return <MapPin color="#fff" size={18} />;
  }
};

export const getCategoryColor = (category) => {
  switch (category) {
    case "food":
      return "#F59E0B"; // Orange
    case "hotel":
      return "#8B5CF6"; // Purple
    case "transport":
      return "#10B981"; // Green
    case "excursion":
      return "#3B82F6"; // Blue
    default:
      return "#EC4899"; // Pink
  }
};
