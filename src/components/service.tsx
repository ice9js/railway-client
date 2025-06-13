import { useCallback, useState } from "react";
import { clsx } from "clsx";
import { Copy, Pause, Play } from "lucide-react";

import type { Deployment, Service as ServiceType } from "~/lib/railway-types";
import { Button } from "~/components/ui/button";
import { Timeline } from "~/components/timeline";
import { removeDeployment, deployServiceInstance } from "~/lib/railway-fetch";
import { getDeploymentRunningInstanceCount } from "~/lib/railway-utils";

interface ServiceProps {
  environmentId: string;
  service: ServiceType;
  deployments: Deployment[];
  refreshProject: () => void;
}

export const Service = ({
  environmentId,
  service,
  deployments,
  refreshProject,
}: ServiceProps) => {
  const [loading, setLoading] = useState(false);

  const lastDeployment = deployments[0];

  const handleStart = useCallback(() => {
    setLoading(true);
    void deployServiceInstance(service.id, environmentId).finally(() => {
      setLoading(false);
      refreshProject();
    });
  }, [service, environmentId, refreshProject]);

  const handleStop = useCallback(async () => {
    if (!lastDeployment) {
      return;
    }

    setLoading(true);
    void removeDeployment(lastDeployment.id).finally(() => {
      setLoading(false);
      refreshProject();
    });
  }, [lastDeployment, refreshProject]);

  const statusClasses = clsx(
    "text-xs font-semibold rounded-sm text-white py-1 px-2 ",
    {
      "bg-orange-500": [
        "BUILDING",
        "DEPLOYING",
        "INITIALIZING",
        "NEEDS_APPROVAL",
        "WAITING",
      ].includes(lastDeployment?.status ?? ""),
      "bg-green-500": ["SUCCESS"].includes(lastDeployment?.status ?? ""),
      "bg-blue-500": ["SLEEPING"].includes(lastDeployment?.status ?? ""),
      "bg-red-500": ["CRASHED", "FAILED"].includes(
        lastDeployment?.status ?? "",
      ),
      "bg-gray-500": ["QUEUED", "REMOVED", "REMOVING", "SKIPPED"].includes(
        lastDeployment?.status ?? "",
      ),
      "animate-pulse": [
        "BUILDING",
        "DEPLOYING",
        "INITIALIZING",
        "REMOVING",
      ].includes(lastDeployment?.status ?? ""),
    },
  );

  const instances = lastDeployment
    ? getDeploymentRunningInstanceCount(lastDeployment)
    : 0;
  const isRunning = instances > 0;

  return (
    <div className="flex w-full flex-row">
      <div className="ml-2 flex flex-1 flex-col">
        <p className="mb-2 text-xl font-bold">{service.name}</p>
        <div className="flex flex-row">
          <span className={statusClasses}>
            {lastDeployment?.status ?? "unknown"}
          </span>
          <span className="ml-2 inline-flex rounded-sm border-1 px-2 py-1 text-xs">
            <Copy className="mr-2 h-3 w-3" />
            {instances}
          </span>
        </div>
      </div>

      {!isRunning && (
        <Button
          className="bg-green-500"
          disabled={loading}
          onClick={handleStart}
        >
          <Play className="h-4 w-4" />
        </Button>
      )}
      {isRunning && (
        <Button className="bg-red-500" disabled={loading} onClick={handleStop}>
          <Pause className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
