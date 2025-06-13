import type {
  User,
  UserProject,
  Project,
  Service,
  Deployment,
  Environment,
} from "~/lib/railway-types";

/**
 * Returns all user's projects.
 */
export const getUserProjects = (user: User): UserProject[] =>
  user.workspaces
    .flatMap(({ team }) => team.projects.edges)
    .map(({ node }) => node);

/**
 * Returns the specific project for the user.
 */
export const getUserProject = (
  user: User,
  projectId: string,
): UserProject | undefined =>
  getUserProjects(user).find((project) => project.id === projectId);

/**
 * Returns the project environments.
 */
export const getProjectEnvironments = (project: Project): Environment[] =>
  project.environments.edges.map(({ node }) => node);

/**
 * Returns the project services.
 */
export const getProjectServices = (project: Project): Service[] =>
  project.services.edges.map(({ node }) => node);

/**
 * Returns the project deployments for the given serviceId and environmentId.
 * Sorted by deployment date, descending.
 */
export const getProjectServiceDeployments = (
  project: Project,
  serviceId: string,
  environmentId: string,
): Deployment[] =>
  project.deployments.edges
    .map(({ node }) => node)
    .filter(
      (deployment) =>
        deployment.serviceId === serviceId &&
        deployment.environmentId === environmentId,
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

/**
 * Returns the count of running deployment instances.
 */
export const getDeploymentRunningInstanceCount = (
  deployment: Deployment,
): number =>
  deployment.instances.filter(({ status }) => {
    return ["INITIALIZING", "RUNNING", "RESTARTING"].includes(status);
  }).length;
