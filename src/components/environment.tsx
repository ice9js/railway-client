import { useCallback, useEffect, useRef, useState } from "react";

import type { Project } from "~/lib/railway-types";
import { Card } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Ruler } from "~/components/ruler";
import { Service } from "~/components/service";
import { fetchProject } from "~/lib/railway-fetch";
import {
  getProjectEnvironments,
  getProjectServices,
  getProjectServiceDeployments,
} from "~/lib/railway-utils";

interface EnvironmentViewProps {
  projectId: string;
}

const EnvironmentView = ({ projectId }: EnvironmentViewProps) => {
  const [project, setProject] = useState<Project | null>(null);
  const [currentEnvironmentId, setCurrentEnvironmentId] = useState("");

  const lastProjectId = useRef(projectId);

  const updateProject = useCallback(() => {
    fetchProject(projectId)
      .then((projectData) => {
        if (lastProjectId.current !== projectId) {
          return;
        }

        setProject(projectData);

        if (projectData.environments.edges.map(({ node }) => node.id ).includes(currentEnvironmentId)) {
            return;
        }

        setCurrentEnvironmentId(
          projectData.environments.edges[0]?.node.id ?? "",
        );
      })
      .catch((error) => {
        console.error("Failed to fetch project:", error);
      });
  }, [currentEnvironmentId, projectId]);

  useEffect(() => {
    lastProjectId.current = projectId;
    updateProject();

    // Poll for updates every 10s
    const updateInterval = setInterval(() => {
    	updateProject();
    }, 15000);

    return () => clearInterval(updateInterval);
  }, [projectId, updateProject]);

  if (!project) {
    return null;
  }

  return (
    <Card className="w-full max-w-4xl">
      <Tabs
        defaultValue={currentEnvironmentId}
        className="flex w-full flex-row justify-end px-4"
        onValueChange={(value) => setCurrentEnvironmentId(value)}
      >
        <TabsList>
          {getProjectEnvironments(project).map((environment) => (
            <TabsTrigger
              key={environment.id}
              value={environment.id}
            >
              {environment.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Separator />

      <div className="grid grid-cols-3 gap-4 px-4">
        <div></div>
        <div className="col-span-2">
          <Ruler />
        </div>
      </div>

      <div className="grid gap-4">
        {getProjectServices(project).map((service) => (
          <Service
            key={service.id}
            environmentId={currentEnvironmentId}
            service={service}
            deployments={getProjectServiceDeployments(project, service.id, currentEnvironmentId)}
            refreshProject={updateProject}
          />
        ))}
      </div>
    </Card>
  );
};

export default EnvironmentView;
