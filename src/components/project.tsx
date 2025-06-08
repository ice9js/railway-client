import { useRailwayUserContext } from '~/context/railway-user-context';

const ProjectView = () => {
	const { user } = useRailwayUserContext();

	if (!user) {
		return null;
	}

	console.log(user);

	return (
		<>
			<div>header</div>
			<div>content</div>
		</>
	);
};

export default ProjectView;