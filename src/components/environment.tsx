import { useCallback, useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { Copy, FileClock, History, Pause, Play } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Ruler } from '~/components/ruler';
import { Timeline } from '~/components/timeline';
import { railwayFetch } from '~/lib/railway-fetch';

const fetchProject = async (projectId) =>
	railwayFetch(`
		query Project {
			project(id: "${projectId}") {
		        id
		        name
		        services {
		            edges {
		                node {
		                    id
		                    name
		                }
		            }
		        }
		        deployments {
		            edges {
		                node {
		                    id
		                    instances {
		                        status
		                    }
		                    canRedeploy
							createdAt
							deploymentStopped
							updatedAt
		                    status
		                    serviceId
		                    url
		                    environmentId
		                }
		            }
		        }
		        environments {
		            edges {
		                node {
		                    id
		                    name
		                }
		            }
		        }
		    }
		}
	`);

const pauseService = async (deployment) =>
	railwayFetch(`
		mutation DeploymentRemove {
		    deploymentRemove(id: "${deployment.id}")
		}
	`);

const startService = async (serviceId, environmentId) =>
	railwayFetch(`
		mutation ServiceInstanceDeploy {
		    serviceInstanceDeploy(environmentId: "${environmentId}", serviceId: "${serviceId}")
		}
	`);

const getEnvironments = (project) =>
	project.environments.edges
		.map(({ node }) => node);

const getServices = (project, environmentId) =>
	project.services.edges
		.map(({ node }) => node);

/**
 * Returns deployment of the given serviceId in the project.
 * Sorted by deployment date, descending.
 *
 * @param  {[type]} project   [description]
 * @param  {[type]} serviceId [description]
 * @return {[type]}           [description]
 */
const getServiceDeployments = (project, serviceId) =>
	project.deployments.edges
		.map(({ node }) => node)
		.filter(({ serviceId: deploymentServiceId }) => deploymentServiceId === serviceId)
		.sort((a , b) => new Date(b.createdAt) - new Date(a.createdAt));

const getLastDeployment = (service) =>
	service.deployments.edges[0]?.node;

const runningDeploymentInstances = (deployment) =>
	deployment.instances.filter(({status}) => [
		'INITIALIZING',
		'RUNNING',
		'RESTARTING',
		'RUNNING',
	].includes(status));

const isDeploymentRunning = (deployment) =>
	runningDeploymentInstances(deployment).length > 0;

const Service = ({environmentId, service, deployments, refreshProject}) => {
	const lastDeployment = deployments[0];

	const handleStart = useCallback(async () => {
		startService(service.id, environmentId)
			.finally(() => refreshProject());
	}, [service, environmentId, refreshProject]);

	const handleStop = useCallback(async () => {
		pauseService(lastDeployment)
			.finally(() => refreshProject());
	}, [lastDeployment, refreshProject]);

	const statusClasses = clsx('text-xs font-semibold rounded-sm text-white py-1 px-2 ', {
		'bg-orange-500': ['BUILDING', 'DEPLOYING', 'INITIALIZING', 'NEEDS_APPROVAL', 'WAITING'].includes(lastDeployment.status),
		'bg-green-500': ['SUCCESS'].includes(lastDeployment.status),
		'bg-blue-500': ['SLEEPING'].includes(lastDeployment.status),
		'bg-red-500': ['CRASHED', 'FAILED'].includes(lastDeployment.status),
		'bg-gray-500': ['QUEUED', 'REMOVED', 'REMOVING', 'SKIPPED'].includes(lastDeployment.status),
		'animate-pulse': ['BUILDING', 'DEPLOYING', 'INITIALIZING', 'REMOVING'].includes(lastDeployment.status)
	});

	const isRunning = lastDeployment && isDeploymentRunning(lastDeployment);
	const instances = lastDeployment ? runningDeploymentInstances(lastDeployment).length : 0;

	return (

		<div className="grid grid-cols-3 gap-4 px-4">
			<div className="flex flex-row">
				{!isRunning && (<Button className="bg-green-500" onClick={handleStart}><Play className="w-4 h-4" /></Button>)}
				{isRunning && (<Button className="bg-red-500" onClick={handleStop}><Pause className="w-4 h-4" /></Button>)}

				<div className="flex flex-col flex-1 ml-2">
					<p className="font-bold text-xl mb-2">
						{service.name}
					</p>
					<div className="flex flex-row">
						<span className={statusClasses}>{lastDeployment.status}</span>
						<span className="text-xs rounded-sm py-1 px-2 ml-2 border-1 inline-flex"><Copy className="w-3 h-3 mr-2" />{instances}</span>
					</div>
				</div>
			</div>
			<div className="col-span-2 flex flex-row">
				<Timeline deployments={deployments} />
			</div>
		</div>
	);
};

const EnvironmentView = ({ projectId }) => {
	const [project, setProject] = useState(null);
	const [currentEnvironmentId, setCurrentEnvironmentId] = useState('');
	const [loading, setLoading] = useState(true);

	const updateProject = useCallback(() => {
		setLoading(true);
		fetchProject(projectId)
			.then((response) => response.json())
			.then((data) => {
				setProject(data.data.project);
				setCurrentEnvironmentId(data.data.project.environments.edges[0]?.node.id || '');
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
					{getEnvironments(project).map((environment) => (
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
				{ getServices(project, currentEnvironmentId).map((service) => (
					<Service
						key={service.id}
						environmentId={currentEnvironmentId}
						service={service}
						deployments={getServiceDeployments(project, service.id)}
						refreshProject={updateProject}
					/>
				))}
			</div>
		</Card>
	);
};

export default EnvironmentView;
