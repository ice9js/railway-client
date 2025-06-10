import { useCallback, useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { Copy, FileClock, History, Pause, Play } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Ruler } from '~/components/ruler';
import { Timeline } from '~/components/timeline';
import { removeDeployment, deployServiceInstance } from '~/lib/railway-fetch';
import { isDeploymentRunning, getDeploymentRunningInstanceCount } from '~/lib/railway-utils';

export const Service = ({environmentId, service, deployments, refreshProject}) => {
	const [loading, setLoading] = useState(false);

	const lastDeployment = deployments[0];

	const handleStart = useCallback(async () => {
		setLoading(true);
		deployServiceInstance(service.id, environmentId)
			.finally(() => {
				setLoading(false);
				refreshProject();
			});
	}, [service, environmentId, refreshProject]);

	const handleStop = useCallback(async () => {
		setLoading(true);
		removeDeployment(lastDeployment.id)
			.finally(() => {
				setLoading(false);
				refreshProject();
			});
	}, [lastDeployment, refreshProject]);

	const statusClasses = clsx('text-xs font-semibold rounded-sm text-white py-1 px-2 ', {
		'bg-orange-500': ['BUILDING', 'DEPLOYING', 'INITIALIZING', 'NEEDS_APPROVAL', 'WAITING'].includes(lastDeployment.status),
		'bg-green-500': ['SUCCESS'].includes(lastDeployment.status),
		'bg-blue-500': ['SLEEPING'].includes(lastDeployment.status),
		'bg-red-500': ['CRASHED', 'FAILED'].includes(lastDeployment.status),
		'bg-gray-500': ['QUEUED', 'REMOVED', 'REMOVING', 'SKIPPED'].includes(lastDeployment.status),
		'animate-pulse': ['BUILDING', 'DEPLOYING', 'INITIALIZING', 'REMOVING'].includes(lastDeployment.status)
	});

	const instances = lastDeployment ? getDeploymentRunningInstanceCount(lastDeployment) : 0;
	const isRunning = instances > 0;

	return (
		<div className="grid grid-cols-3 gap-4 px-4">
			<div className="flex flex-row">
				{!isRunning && (<Button className="bg-green-500" disabled={loading} onClick={handleStart}><Play className="w-4 h-4" /></Button>)}
				{isRunning && (<Button className="bg-red-500" disabled={loading} onClick={handleStop}><Pause className="w-4 h-4" /></Button>)}

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
