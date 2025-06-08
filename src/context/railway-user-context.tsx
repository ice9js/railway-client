"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const fetchRailwayUser = async (apiKey) =>
	fetch('/api/railway', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			query: `
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
			`,
		}),
	});

const RailwayUserContext = createContext(null);

export const RailwayUserProvider = ({ children }) => {
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [user, setUser] = useState(null);

	const setApiKey = useCallback(async (apiKey) => {
		setLoading(true);
		setError('');

		try {
			const response = await fetchRailwayUser(apiKey);
			const data = await response.json();

			localStorage.setItem('railway.apiKey', apiKey);

			setUser(data.data.me);
		} catch (err) {
			setError('Failed to fetch account information. Check if your API key is correct.');
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		const storedApiKey = localStorage.getItem('railway.apiKey');

		if (storedApiKey) {
			setApiKey(storedApiKey);
		}
	}, []);

	const context = useMemo(() => ({
		error,
		loading,
		user,
		setApiKey,
	}), [error, loading, user, setApiKey]);

	return (
		<RailwayUserContext.Provider value={context}>
			{children}
		</RailwayUserContext.Provider>
	);
};

export const useRailwayUserContext = () => useContext(RailwayUserContext);
