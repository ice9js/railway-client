import { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { Copy, FileClock, History, Pause, Play } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
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

const Service = ({environmentId, service, deployments}) => {
	const lastDeployment = deployments[0];

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
		<Card className="w-full mb-4">
			<CardContent className="flex flex-row items-start gap-4">
				<div className="flex flex-col flex-1">
					<p className="font-bold text-xl mb-2">
						{service.name}
					</p>
					<div className="flex flex-row">
						<span className={statusClasses}>{lastDeployment.status}</span>
						<span className="text-xs rounded-sm py-1 px-2 ml-2 border-1 inline-flex"><Copy className="w-3 h-3 mr-2" />{instances}</span>
					</div>
				</div>
				<Button variant="outline"><History className="w-4 h-4" /></Button>
				<Button variant="outline"><FileClock className="w-4 h-4" /></Button>
				{!isRunning && (<Button className="bg-green-500" onClick={() => startService(service.id, environmentId)}><Play className="w-4 h-4" /></Button>)}
				{isRunning && (<Button className="bg-red-500" onClick={() => pauseService(lastDeployment)}><Pause className="w-4 h-4" /></Button>)}
			</CardContent>
		</Card>
	);
};

const EnvironmentView = ({ projectId }) => {
	const [project, setProject] = useState(null);
	const [currentEnvironmentId, setCurrentEnvironmentId] = useState('');
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// some race conditions here!
		// this runs multiple times
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

	if (!project || loading) {
		return null;
	}

	return (
		<Card className="w-full max-w-4xl px-8">
			<div></div> {/*toggle*/}

			<div>
				{ getServices(project, currentEnvironmentId).map((service) => (
					<Service
						key={service.id}
						environmentId={currentEnvironmentId}
						service={service}
						deployments={getServiceDeployments(project, service.id)}
					/>
				))}
			</div>
		</Card>
	);
};

export default EnvironmentView;
