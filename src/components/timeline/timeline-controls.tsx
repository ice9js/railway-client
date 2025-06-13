"use client";

import { ChevronLeft, ChevronRight, Home, ZoomIn, ZoomOut } from "lucide-react";

import { Button } from "~/components/ui/button";
import { ZoomLevel } from "~/lib/timeline-utils";

interface TimelineControlsProps {
  zoomLevel: ZoomLevel;
  setZoomLevel: (level: ZoomLevel) => void;
  moveTimelineLeft: () => void;
  moveTimelineRight: () => void;
  resetToToday: () => void;
  currentDateRange: string;
}

export function TimelineControls({
  zoomLevel,
  setZoomLevel,
  moveTimelineLeft,
  moveTimelineRight,
  resetToToday,
  currentDateRange,
}: TimelineControlsProps) {
  const handleZoomIn = () => {
    if (zoomLevel > ZoomLevel.Minute) {
      setZoomLevel(zoomLevel - 1);
    }
  };

  const handleZoomOut = () => {
    if (zoomLevel < ZoomLevel.Month) {
      setZoomLevel(zoomLevel + 1);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="text-sm font-medium">{currentDateRange}</div>
      <div className="flex items-center space-x-1">
        <Button variant="outline" size="icon" onClick={moveTimelineLeft}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={resetToToday}>
          <Home className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={moveTimelineRight}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          disabled={zoomLevel <= ZoomLevel.Minute}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          disabled={zoomLevel >= ZoomLevel.Month}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
