"use client";

import type React from "react";

import { useRef, useState, useEffect } from "react";
import { differenceInMinutes, isAfter, isBefore, parseISO } from "date-fns";

import type { Deployment, Project } from "~/lib/railway-types";
import {
  getProjectServices,
  getProjectServiceDeployments,
} from "~/lib/railway-utils";
import { type ZoomLevel, getTimelineIntervals } from "~/lib/timeline-utils";

interface TimelineProps {
  project: Project;
  currentEnvironmentId: string;
  startDate: Date;
  endDate: Date;
  zoomLevel: ZoomLevel;
  onZoomToTime: (time: Date) => void;
}

const getJobOffset = (
  deployment: Deployment,
  startDate: Date,
  totalMinutes: number,
): Record<string, string> => {
  const jobStartTime = parseISO(deployment.createdAt);
  const jobEndTime = deployment.deploymentStopped
    ? parseISO(deployment.updatedAt)
    : new Date();

  const startMinutes = Math.max(
    0,
    differenceInMinutes(jobStartTime, startDate),
  );
  const endMinutes = Math.min(
    totalMinutes,
    differenceInMinutes(jobEndTime, startDate),
  );

  const leftPercentage = (startMinutes / totalMinutes) * 100;
  const widthPercentage = ((endMinutes - startMinutes) / totalMinutes) * 100;

  return {
    left: `${leftPercentage}%`,
    // need resulution prop for min-width
    width: `${Math.max(0.1, widthPercentage)}%`,
  };
};

const TimelineItem = ({
  deployment,
  offset,
}: {
  deployment: Deployment;
  offset: Record<string, string>;
}) => {
  return (
    <div
      key={deployment.id}
      className="absolute z-5 h-16 -translate-y-1/2 transform cursor-pointer rounded border-2 border-blue-500 bg-blue-400/60"
      style={{ ...offset, top: "50%" }}
    />
  );
};

export function Timeline({
  project,
  currentEnvironmentId,
  startDate,
  endDate,
  zoomLevel,
}: TimelineProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  // Generate timeline columns based on start date, end date, and zoom level
  const columns = getTimelineIntervals(startDate, endDate, zoomLevel);

  // Calculate total minutes in the timeline for positioning
  const totalMinutes = differenceInMinutes(endDate, startDate);

  // Scroll to center (current time) on initial load
  useEffect(() => {
    if (scrollContainerRef.current && !isScrolling) {
      const now = new Date();
      if (isAfter(now, startDate) && isBefore(now, endDate)) {
        const minutesSinceStart = differenceInMinutes(now, startDate);
        const scrollPosition =
          (minutesSinceStart / totalMinutes) *
          scrollContainerRef.current.scrollWidth;
        scrollContainerRef.current.scrollLeft =
          scrollPosition - scrollContainerRef.current.clientWidth / 2;
      } else {
        scrollContainerRef.current.scrollLeft = 0;
      }
    }
  }, [startDate, endDate, totalMinutes, isScrolling]);

  return (
    <div
      ref={scrollContainerRef}
      // @todo: add overflow and make scrollable?
      className="flex-1"
      onScroll={() => setIsScrolling(true)}
      onScrollEnd={() => setIsScrolling(false)}
    >
      <div className="relative min-w-full">
        {/* Timeline header with continuous background and sparse labels */}
        <div className="bg-muted/50 relative sticky top-0 z-10 flex h-12 flex-row border-b">
          {/* Time labels */}
          {columns.map(
            ({ index, label, position }) =>
              label &&
              index !== columns.length - 1 && (
                <div
                  key={index}
                  className="flex h-full flex-auto items-center justify-start border-r pl-4 text-xs font-medium last:border-r-0"
                  style={{
                    left: `${position}%`,
                    minWidth: "60px",
                  }}
                >
                  {label}
                </div>
              ),
          )}
        </div>

        {/* Timeline grid with container rows */}
        <div className="relative">
          {getProjectServices(project).map((service) => (
            <div
              key={service.id}
              className="hover:bg-muted/20 relative flex h-24 border-b"
            >
              {/* Long-running job bars overlay */}
              <div className="pointer-events-none absolute inset-0">
                <div className="pointer-events-auto relative h-full">
                  {getProjectServiceDeployments(
                    project,
                    service.id,
                    currentEnvironmentId,
                  ).map((deployment) => (
                    <TimelineItem
                      key={deployment.id}
                      deployment={deployment}
                      offset={getJobOffset(deployment, startDate, totalMinutes)}
                      // onJobClick={(actualJob) => (event) => onJobClick(actualJob, event)}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Current time indicator */}
        <div
          className="absolute top-12 bottom-0 z-20 w-0.5 bg-red-500"
          style={{
            left: `${(differenceInMinutes(new Date(), startDate) / totalMinutes) * 100}%`,
            display:
              isAfter(new Date(), startDate) && isBefore(new Date(), endDate)
                ? "block"
                : "none",
          }}
        />
      </div>
    </div>
  );
}
