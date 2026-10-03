"use client";

import { useState, useRef } from "react";
import { useGlobeScene } from "@/hooks/useGlobeScene";
import { useGlobeInteraction } from "@/hooks/useGlobeInteraction";
import { useMapData } from "@/hooks/useMapData";
import { usePinPositions } from "@/hooks/usePinPositions";
import { useAffiliateLinks } from "@/hooks/useAffiliateLinks";
import { MapHeader } from "@/components/MapPage/MapHeader";
import { MapControls } from "@/components/MapPage/MapControls";
import { MapLegend } from "@/components/MapPage/MapLegend";
import { DestinationPin } from "@/components/MapPage/DestinationPin";
import { LoadingOverlay } from "@/components/MapPage/LoadingOverlay";
import { SidePanel } from "@/components/MapPage/SidePanel/SidePanel";
import { ZoomIn, ZoomOut } from "lucide-react";

export default function MapPage() {
  const canvasRef = useRef(null);
  const [selectedDest, setSelectedDest] = useState(null);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");

  const { destinations, venues, isLoading } = useMapData(filterCategory);

  const {
    globeRef,
    cameraRef,
    globeMatRef,
    isDragging,
    previousMouse,
    rotationVelocity,
    autoRotate,
    globeReady,
  } = useGlobeScene(canvasRef);

  useGlobeInteraction(
    canvasRef,
    globeRef,
    cameraRef,
    isDragging,
    previousMouse,
    rotationVelocity,
    autoRotate,
  );

  const pinPositions = usePinPositions(
    globeReady,
    destinations,
    globeRef,
    cameraRef,
    canvasRef,
  );

  const { groupedAffLinks } = useAffiliateLinks(selectedDest);

  const handleResetView = () => {
    if (globeRef.current) {
      autoRotate.current = true;
      rotationVelocity.current = { x: 0, y: 0 };
    }
    if (cameraRef.current) {
      cameraRef.current.position.z = 3.5;
    }
    setSelectedDest(null);
    setSelectedVenue(null);
  };

  const handlePinClick = (pin) => {
    setSelectedDest(pin);
    setSelectedVenue(null);
    autoRotate.current = false;
  };

  const handleClosePanel = () => {
    setSelectedDest(null);
    setSelectedVenue(null);
  };

  const handleZoomIn = () => {
    if (!cameraRef.current) return;
    const minZ = 1.8;
    const newZ = cameraRef.current.position.z - 0.5;
    cameraRef.current.position.z = Math.max(minZ, newZ);
    autoRotate.current = false;
  };

  const handleZoomOut = () => {
    if (!cameraRef.current) return;
    const maxZ = 8;
    const newZ = cameraRef.current.position.z + 0.5;
    cameraRef.current.position.z = Math.min(maxZ, newZ);
    autoRotate.current = false;
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] relative overflow-hidden">
      <MapHeader
        destinationCount={destinations.length}
        isLoading={isLoading}
        onResetView={handleResetView}
      />

      {/* Flat Map link */}
      <div className="absolute top-3 right-44 z-20">
        <a
          href="/flat-map"
          className="bg-[#1E293B] border border-[#334155] text-white font-bold py-2 px-3 rounded-xl text-sm flex items-center gap-1.5 hover:border-[#FF006E] transition-all"
          title="Switch to flat map"
        >
          <span className="text-[#FF006E]">📍</span>
          <span className="hidden sm:inline text-xs">Flat Map</span>
        </a>
      </div>

      <MapControls
        filterCategory={filterCategory}
        onFilterChange={setFilterCategory}
      />

      <MapLegend />

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="bg-[#1E293B] border border-[#334155] text-white p-2.5 rounded-xl hover:border-[#3B82F6] transition-all"
          title="Zoom in"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-[#1E293B] border border-[#334155] text-white p-2.5 rounded-xl hover:border-[#3B82F6] transition-all"
          title="Zoom out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
      </div>

      {/* Help hint */}
      <div className="absolute bottom-4 right-28 z-20 bg-[#1E293B] bg-opacity-90 border border-[#334155] rounded-xl px-4 py-2 hidden md:block backdrop-blur-sm">
        <p className="text-xs text-[#64748B] font-semibold">
          🖱️ Drag to rotate · Scroll to zoom · Click a pin for details
        </p>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full cursor-grab active:cursor-grabbing"
        style={{ height: "100vh", touchAction: "none" }}
      />

      {pinPositions.map((pin) => (
        <DestinationPin
          key={pin.destination_name}
          pin={pin}
          isSelected={selectedDest?.destination_name === pin.destination_name}
          onClick={() => handlePinClick(pin)}
        />
      ))}

      <SidePanel
        selectedDest={selectedDest}
        venues={venues}
        selectedVenue={selectedVenue}
        onVenueSelect={setSelectedVenue}
        onClose={handleClosePanel}
        groupedAffLinks={groupedAffLinks}
      />

      {isLoading && <LoadingOverlay />}
    </div>
  );
}
