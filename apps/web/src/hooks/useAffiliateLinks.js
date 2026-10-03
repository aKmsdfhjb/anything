import { useEffect, useState, useMemo } from "react";

export function useAffiliateLinks(selectedDest) {
  const [affiliateLinks, setAffiliateLinks] = useState([]);

  useEffect(() => {
    if (!selectedDest) {
      setAffiliateLinks([]);
      return;
    }
    const fetchLinks = async () => {
      try {
        const res = await fetch(
          `/api/affiliates/links?destination=${encodeURIComponent(selectedDest.destination_name)}&country=${encodeURIComponent(selectedDest.destination_country)}`,
        );
        if (res.ok) {
          const data = await res.json();
          setAffiliateLinks(data.links || []);
        }
      } catch (err) {
        console.error("Error fetching affiliate links:", err);
      }
    };
    fetchLinks();
  }, [selectedDest]);

  const groupedAffLinks = useMemo(() => {
    const grouped = {};
    affiliateLinks.forEach((link) => {
      if (!grouped[link.category]) grouped[link.category] = [];
      grouped[link.category].push(link);
    });
    return grouped;
  }, [affiliateLinks]);

  return { affiliateLinks, groupedAffLinks };
}
