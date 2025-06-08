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
