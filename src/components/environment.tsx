import { useCallback, useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { Copy, FileClock, History, Pause, Play } from 'lucide-react';

import type { Project } from '~/lib/railway-types';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Ruler } from '~/components/ruler';
import { Service } from '~/components/service';
import { Timeline } from '~/components/timeline';
import { fetchProject } from '~/lib/railway-fetch';
import { getProjectEnvironments, getProjectServices, getProjectServiceDeployments } from '~/lib/railway-utils';

interface EnvironmentViewProps {
	projectId: string;
}

const EnvironmentView = ({ projectId }: EnvironmentViewProps) => {
	const [project, setProject] = useState<Project|null>(null);
	const [currentEnvironmentId, setCurrentEnvironmentId] = useState('');
	const [loading, setLoading] = useState(true);

	const updateProject = useCallback(() => {
		setLoading(true);
		fetchProject(projectId)
			.then((projectData) => {
				setProject(projectData);
				setCurrentEnvironmentId(projectData.environments.edges[0]?.node.id || '');
				setLoading(false);
			})
			.catch((error) => {
				console.error('Failed to fetch project:', error);
				setLoading(false);
			});

	}, [projectId]);

	useEffect(() => {
		updateProject();

		// Poll for updates every 10s
		// const updateInterval = setInterval(() => {
		// 	updateProject();
		// }, 10000);

		// return () => clearInterval(updateInterval);
	}, [projectId, updateProject]);

	if (!project) {
		return null;
	}

	return (
		<Card className="w-full max-w-4xl">
			<Tabs
				defaultValue={currentEnvironmentId}
				className="flex flex-row justify-end w-full px-4"
			>
				<TabsList>
					{getProjectEnvironments(project).map((environment) => (
						<TabsTrigger
							key={environment.id}
							value={environment.id}
							onClick={() => setCurrentEnvironmentId(environment.id)}
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
				{ getProjectServices(project, currentEnvironmentId).map((service) => (
					<Service
						key={service.id}
						environmentId={currentEnvironmentId}
						service={service}
						deployments={getProjectServiceDeployments(project, service.id)}
						refreshProject={updateProject}
					/>
				))}
			</div>
		</Card>
	);
};

export default EnvironmentView;
