"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { fetchUser } from '~/lib/railway-fetch';

const RailwayUserContext = createContext(null);

export const RailwayUserProvider = ({ children }) => {
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [user, setUser] = useState(null);

	const setApiKey = useCallback(async (apiKey) => {
		setLoading(true);
		setError('');

		try {
			localStorage.setItem('railway.apiKey', apiKey);

			const response = await fetchUser();
			const data = await response.json();

			setUser(data.data.me);
		} catch (err) {
			console.error(err);
			localStorage.removeItem('railway.apiKey', apiKey);
			setError('Failed to fetch account information. Check if your API key is correct.');
		} finally {
			setLoading(false);
		}
	}, []);

	const resetUser = useCallback(() => {
		localStorage.removeItem('railway.apiKey');
		setUser(null);
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
