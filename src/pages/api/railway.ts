import { type NextApiRequest, type NextApiResponse } from "next";

const API_HOST = 'https://backboard.railway.app/graphql/v2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	if (!req.headers.authorization?.startsWith('Bearer ')) {
		return res.status(401).json({ error: 'Unauthorized' });
	}

	try {
		const response = await fetch(API_HOST, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': req.headers.authorization,
			},
			body: JSON.stringify(req.body),
		});

		const data = await response.json();
		res.status(response.status).json(data);
	} catch (err) {
		console.log((err as Error).message);
		res.status(500).json({ error: 'Failed to proxy request' });
	}
}
