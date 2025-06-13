"use client";

import type React from "react";

import { format } from "date-fns";

import { Service } from "~/components/service";
import { useTimelineState } from "~/hooks/use-timeline-state";
import type { Project } from "~/lib/railway-types";
import {
  getProjectServices,
  getProjectServiceDeployments,
} from "~/lib/railway-utils";
import { Timeline } from "./timeline";
import { TimelineControls } from "./timeline-controls";

interface DashboardProps {
  project: Project;
  currentEnvironmentId: string;
  refreshProject: () => void;
}

export const Dashboard = ({
  currentEnvironmentId,
  project,
  refreshProject,
}: DashboardProps) => {
  const {
    startDate,
    endDate,
    zoomLevel,
    setZoomLevel,
    moveTimelineLeft,
    moveTimelineRight,
    resetToToday,
    zoomToTime,
  } = useTimelineState();

  return (
    <div className="flex flex-col space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Deployments Timeline</h1>
        <TimelineControls
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
          moveTimelineLeft={moveTimelineLeft}
          moveTimelineRight={moveTimelineRight}
          resetToToday={resetToToday}
          currentDateRange={`${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`}
        />
      </div>

      <div className="flex flex-1 overflow-hidden rounded-lg border">
        <div className="bg-muted/20 w-96 border-r">
          <div className="bg-muted/50 sticky top-0 z-10 h-12 border-b p-2 text-xs font-medium">
            Services
          </div>
          <div>
            {getProjectServices(project).map((service) => (
              <div
                key={service.id}
                className="flex h-24 items-center border-b p-3"
              >
                <Service
                  environmentId={currentEnvironmentId}
                  deployments={getProjectServiceDeployments(
                    project,
                    service.id,
                    currentEnvironmentId,
                  )}
                  service={service}
                  refreshProject={refreshProject}
                />
              </div>
            ))}
          </div>
        </div>

        <Timeline
          currentEnvironmentId={currentEnvironmentId}
          project={project}
          startDate={startDate}
          endDate={endDate}
          zoomLevel={zoomLevel}
          onZoomToTime={zoomToTime}
        />
      </div>
    </div>
  );
};
