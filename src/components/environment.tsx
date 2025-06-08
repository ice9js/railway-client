import { useEffect, useState } from 'react';
import { clsx } from 'clsx';

import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { railwayFetch } from '~/lib/railway-fetch';

const fetchProject = async (projectId) =>
	railwayFetch(`
		query Project {
			project(id: "${projectId}") {
				id
				name
				environments {
					edges {
						node {
							id
							name
						}
					}
				}
				services {
					edges {
						node {
							id
							name
							deployments {
								edges {
									node {
										createdAt
										serviceId
										status
										updatedAt
										deploymentStopped
										environment {
										    name
										    id
										}
									}
								}
							}
						}
					}
				}
			}
		}
	`, { projectId });

const getServices = (project, environmentId) =>
	project.services.edges
		.map(({ node }) => node)
		.filter(({ deployments }) => deployments.edges.some(({ node }) => node.environment.id === environmentId));

const getLastDeployment = (service) =>
	service.deployments.edges[0]?.node;

const getLastActiveDeployment = (service) => {

};

const Service = ({service}) => {
	const lastDeployment = getLastDeployment(service);

	const statusClasses = clsx('text-xs font-bold rounded-sm text-white py-1 px-2 ml-2', {
		'bg-orange-500': ['BUILDING', 'DEPLOYING', 'INITIALIZING', 'NEEDS_APPROVAL'].includes(lastDeployment.status),
		'bg-green-500': ['SUCCESS'].includes(lastDeployment.status),
		'bg-red-500': ['CRASHED', 'FAILED'].includes(lastDeployment.status),
		'bg-gray-500': ['QUEUED', 'REMOVED', 'REMOVING', 'SKIPPED', 'SLEEPING', 'WAITING'].includes(lastDeployment.status),
		'animate-pulse': ['BUILDING', 'DEPLOYING', 'INITIALIZING', 'REMOVING'].includes(lastDeployment.status)
	});

	return (
		<Card className="w-full mb-4">
			<CardContent className="flex flex-row items-start gap-4">
				<div className="flex-auto grid grid-cols-2">
					<h3 className="font-bold col-span-2">{service.name}</h3>
					<p className="text-sm text-gray-500 flex items-center">
						Status:
						<span className={statusClasses}>{lastDeployment.status}</span>
					</p>
				</div>
				<Button variant="outline">Start/Stop</Button>
				<Button>View Logs</Button>
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

	// console.log(currentEnvironmentId);
	// console.log(project);

	return (
		<div className="w-full max-w-4xl">
			<div></div> {/*toggle*/}

			<div>
				{ getServices(project, currentEnvironmentId).map((service) => (
					<Service key={service.id} service={service} />
				))}
			</div>
		</div>
	);
};

export default EnvironmentView;
