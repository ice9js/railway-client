export type User = {
	id: string;
	name: string;
	avatar: string | null;
	workspaces: {
		team: {
			projects: {
				edges: {
					node: UserProject;
				}[];
			};
		};
	}[];
};

export type UserProject = {
	id: string;
	name: string;
};

export type Project = {
	id: string;
	name: string;
	isPublic: boolean;
	deletedAt: string | null;
	createdAt: string;

	services: {
		edges: {
			node: Service;
		}[];
	};
	deployments: {
		edges: {
			node: Deployment;
		}[];
	};
	environments: {
		edges: {
			node: Environment;
		}[];
	};
};

export type Service = {
	id: string;
	name: string;
};

export type Deployment = {
	id: string;
	instances: {
		status: string;
	}[];
	canRedeploy: boolean;
	createdAt: string;
	deploymentStopped: boolean;
	updatedAt: string;
	status: string;
	serviceId: string;
	url: string | null;
	environmentId: string;
};

export type Environment = {
	id: string;
	name: string;
};
