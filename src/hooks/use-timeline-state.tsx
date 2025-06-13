"use client";

import { useState, useCallback } from "react";
import {
  type Duration,
  add,
  sub,
  addDays,
  startOfDay,
  subMinutes,
} from "date-fns";

import { ZoomLevel } from "~/lib/timeline-utils";

const getZoomLevelWindowInterval = (zoomLevel: ZoomLevel): Duration => {
  if (zoomLevel === ZoomLevel.Minute) {
    return { hours: 1 };
  }

  if (zoomLevel === ZoomLevel.FiveMinutes) {
    return { hours: 3 };
  }

  if (zoomLevel === ZoomLevel.QuarterHour) {
    return { days: 1 };
  }

  if (zoomLevel === ZoomLevel.Hour) {
    return { days: 2 };
  }

  if (zoomLevel === ZoomLevel.Day) {
    return { days: 7 };
  }

  if (zoomLevel === ZoomLevel.Week) {
    return { days: 14 };
  }

  if (zoomLevel === ZoomLevel.Month) {
    return { days: 30 };
  }

  throw new Error(`Unsupported zoom level: ${zoomLevel}`);
};

export function useTimelineState() {
  // Default to showing current day with 15min intervals
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(ZoomLevel.QuarterHour);
  const [startDate, setStartDate] = useState<Date>(startOfDay(new Date()));
  const [endDate, setEndDate] = useState<Date>(
    addDays(startOfDay(new Date()), 1),
  );

  // Update date range based on zoom level
  const updateDateRange = useCallback(
    (newStartDate: Date, newZoomLevel: ZoomLevel) => {
      const newEndDate = add(
        newStartDate,
        getZoomLevelWindowInterval(newZoomLevel),
      );

      setStartDate(newStartDate);
      setEndDate(newEndDate);
    },
    [],
  );

  // Update zoom level and adjust date range accordingly
  const handleSetZoomLevel = useCallback(
    (newZoomLevel: ZoomLevel) => {
      setZoomLevel(newZoomLevel);
      updateDateRange(startDate, newZoomLevel);
    },
    [startDate, updateDateRange],
  );

  // Move timeline left (back in time)
  const moveTimelineLeft = useCallback(() => {
    updateDateRange(
      sub(startDate, getZoomLevelWindowInterval(zoomLevel)),
      zoomLevel,
    );
  }, [startDate, zoomLevel, updateDateRange]);

  // Move timeline right (forward in time)
  const moveTimelineRight = useCallback(() => {
    updateDateRange(endDate, zoomLevel);
  }, [endDate, zoomLevel, updateDateRange]);

  // Reset to today
  const resetToToday = useCallback(() => {
    const today = startOfDay(new Date());
    updateDateRange(today, zoomLevel);
  }, [zoomLevel, updateDateRange]);

  // Zoom to a specific time (zoom in one level and center on that time)
  const zoomToTime = useCallback(
    (time: Date) => {
      if (zoomLevel <= ZoomLevel.Minute) return; // Already at maximum zoom

      const newZoomLevel = zoomLevel - 1;

      // Calculate new start date to center the target time
      let timeOffset: number;
      switch (newZoomLevel) {
        case ZoomLevel.Minute:
          timeOffset = 30; // 30 minutes before target
          break;
        case ZoomLevel.FiveMinutes:
          timeOffset = 60; // 1 hour before target
          break;
        case ZoomLevel.QuarterHour:
          timeOffset = 12 * 60; // 12 hours before target
          break;
        case ZoomLevel.Hour:
          timeOffset = 24 * 60; // 1 day before target
          break;
        case ZoomLevel.Day:
          timeOffset = 3 * 24 * 60; // 3 days before target
          break;
        case ZoomLevel.Week:
          timeOffset = 7 * 24 * 60; // 1 week before target
          break;
        default:
          timeOffset = 60;
      }

      const newStartDate = subMinutes(time, timeOffset);
      setZoomLevel(newZoomLevel);
      updateDateRange(newStartDate, newZoomLevel);
    },
    [zoomLevel, updateDateRange],
  );

  return {
    startDate,
    endDate,
    zoomLevel,
    setZoomLevel: handleSetZoomLevel,
    moveTimelineLeft,
    moveTimelineRight,
    resetToToday,
    zoomToTime,
  };
}
