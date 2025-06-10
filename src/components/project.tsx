import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { Button } from '~/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '~/components/ui/dropdown-menu';
import { useRailwayUserContext } from '~/context/railway-user-context';
import Environment from '~/components/environment';
import { getUserProjects, getUserProject } from '~/lib/railway-utils';

const ProjectView = () => {
	const [ currentProjectId, setCurrentProjectId ] = useState('');
	const { resetUser, user } = useRailwayUserContext();

	useEffect(() => {
		setCurrentProjectId((user && getUserProjects(user)[0]?.id) ?? '');
	}, [user]);

	if (!user) {
		return null;
	}

	if (!currentProjectId) {
		return 'No projects detected :(';
	}

	const currentProject = getUserProject(user, currentProjectId);

	return (
		<>
			<div className="flex flex-row items-center justify-between w-full max-w-4xl mb-12">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline">
							{currentProject?.name}
							<ChevronDown className="w-4 h-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						{getUserProjects(user).map((project) => (
							<DropdownMenuItem key={project.id} onClick={() => setCurrentProjectId(project.id)}>
								{project.name}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button>
							{user.name}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuItem onClick={() => resetUser()}>Log out</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<Environment projectId={currentProjectId} />
		</>
	);
};

export default ProjectView;