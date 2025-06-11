"use client";

import type { User, Project } from "~/lib/railway-types";

export const railwayFetch = async (query: string): Promise<any> =>
  fetch("/api/railway", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("railway.apiKey")}`,
    },
    body: JSON.stringify({ query }),
  }).then((response) => response.json());

export const fetchUser = async (): Promise<User> =>
  railwayFetch(`
		query Me {
		    me {
		        avatar
		        id
		        name
		        workspaces {
		            team {
		                projects {
		                    edges {
		                        node {
		                            id
		                            name
		                            isPublic
		                            deletedAt
		                            createdAt
		                        }
		                    }
		                }
		            }
		        }
		    }
		}
	`).then(({ data }) => data.me);

export const fetchProject = async (projectId: string): Promise<Project> =>
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
	`).then(({ data }) => data.project);

export const removeDeployment = async (deploymentId: string) =>
  railwayFetch(`
		mutation DeploymentRemove {
		    deploymentRemove(id: "${deploymentId}")
		}
	`);

export const deployServiceInstance = async (
  serviceId: string,
  environmentId: string,
) =>
  railwayFetch(`
		mutation ServiceInstanceDeploy {
		    serviceInstanceDeploy(environmentId: "${environmentId}", serviceId: "${serviceId}")
		}
	`);
