import type { Deployment } from "~/lib/railway-types";
import { Card } from "~/components/ui/card";

interface TimelineItemProps {
  start: Date;
  end: Date;
  now: Date;
}

export const TimelineItem = ({ start, end, now }: TimelineItemProps) => {
  const totalTime =
    end.getTime() - Math.max(start.getTime(), now.getTime() - 60 * 60 * 1000);
  const endTime = now.getTime() - end.getTime();

  const styles = {
    right: `${Math.max(100, endTime) / (60 * 60 * 10)}%`,
    width: `${totalTime / (60 * 60 * 10)}%`,
  };

  return <div className="absolute h-full bg-green-300" style={styles}></div>;
};

const getDeploymentsFromLastHour = (deployments: Deployment[]) =>
  deployments.filter(
    ({ deploymentStopped, updatedAt }) =>
      !deploymentStopped ||
      new Date(updatedAt) > new Date(Date.now() - 60 * 60 * 1000),
  );

interface TimelineProps {
  deployments: Deployment[];
}

export const Timeline = ({ deployments }: TimelineProps) => {
  const now = new Date();
  const activeDeployments = getDeploymentsFromLastHour(deployments);

  return (
    <Card className="relative w-full overflow-hidden p-0 shadow-none">
      {activeDeployments.map((deployment) => (
        <TimelineItem
          key={deployment.id}
          start={new Date(deployment.createdAt)}
          end={
            deployment.deploymentStopped ? new Date(deployment.updatedAt) : now
          }
          now={now}
        />
      ))}
    </Card>
  );
};
