import { useState, useEffect } from "react";
import * as Location from "expo-location";

export function useLocation(auth) {
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    (async () => {
      if (auth) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          getCurrentLocation();
        }
      }
    })();
  }, [auth]);

  const getCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = position.coords;
      setLocation({ latitude, longitude });

      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses && addresses.length > 0) {
        const address = addresses[0];
        const name = [address.city, address.region, address.country]
          .filter(Boolean)
          .join(", ");
        setLocationName(name);
      }
    } catch (error) {
      console.error("Error getting location:", error);
    } finally {
      setGettingLocation(false);
    }
  };

  return {
    location,
    locationName,
    gettingLocation,
    getCurrentLocation,
  };
}
