"use client"

export const railwayFetch = async (query) =>
	fetch('/api/railway', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${localStorage.getItem('railway.apiKey')}`
		},
		body: JSON.stringify({ query })
	});

export const fetchUser = async () =>
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
	`);

export const fetchProject = async (projectId) =>
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

export const removeDeployment = async (deploymentId) =>
	railwayFetch(`
		mutation DeploymentRemove {
		    deploymentRemove(id: "${deploymentId}")
		}
	`);

export const deployServiceInstance = async(serviceId, environmentId) =>
	railwayFetch(`
		mutation ServiceInstanceDeploy {
		    serviceInstanceDeploy(environmentId: "${environmentId}", serviceId: "${serviceId}")
		}
	`);
