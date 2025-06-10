/**
 * Returns all user's projects.
 */
export const getUserProjects = (user) =>
	user.workspaces
		.flatMap(({ team }) => team.projects.edges)
		.map(({ node }) => ({ id: node.id, name: node.name }));

/**
 * Returns the specific project for the user.
 */
export const getUserProject = (user, projectId) =>
	getUserProjects(user).find((project) => project.id === projectId) || null;

/**
 * Returns the project environments.
 */
export const getProjectEnvironments = (project) =>
	project.environments.edges.map(({ node }) => node);

/**
 * Returns the project services.
 */
export const getProjectServices = (project, environmentId) =>
	project.services.edges
		.map(({ node }) => node);

/**
 * Returns the project deployments for the given serviceId.
 * Sorted by deployment date, descending.
 */
export const getProjectServiceDeployments = (project, serviceId) =>
	project.deployments.edges
		.map(({ node }) => node)
		.filter(({ serviceId: deploymentServiceId }) => deploymentServiceId === serviceId)
		.sort((a , b) => new Date(b.createdAt) - new Date(a.createdAt));

/**
 * Returns the count of running deployment instances.
 */
export const getDeploymentRunningInstanceCount = (deployment) =>
	deployment.instances.filter(({status}) => {
		return ['INITIALIZING', 'RUNNING', 'RESTARTING'].includes(status);
	}).length;
