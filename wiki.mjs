'use strict';
import axios from 'axios';
import Queue from 'async-await-queue';

export const main = 15580374;
export const depth = 2;
const maxLinks = 5;
const maxRetries = 5;
const maxLag = 5;

const http = axios.create({
	baseURL: 'https://en.wikipedia.org/w/api.php',
	responseType: 'json'
});
const queue = new Queue(4, 10);

export let reqCounter = 0;
async function doRequest(url, prio) {
	let retries = maxRetries;

	reqCounter++;
	const me = Symbol();
	let lastError;
	do {
		try {
			await queue.wait(me, prio);
			const r = (await http.get(url)).data;
			return r;
		} catch (e) {
			retries--;
			console.warn('error', url);
			lastError = e;
		} finally {
			queue.end(me);
		}
	} while (retries > 0);
	console.error(lastError);
	throw lastError;
}

export async function linksHere(id) {
	console.log('getting page links for', id);
	const r = await doRequest(`?action=query&prop=linkshere&pageids=${id}&format=json&lhlimit=${maxLinks}&maxlag=${maxLag}`, 0);
	return r.query.pages[id].linkshere ?
		r.query.pages[id].linkshere.map(x => x.pageid) : 
		[];
}

export async function info(id) {
	console.log('getting info for', id);
	const r = await doRequest(`?action=query&prop=info&pageids=${id}&format=json&maxlag=${maxLag}`, 1);
	return r.query.pages[id];
}

export function sort(r) {
	console.log({ reqCounter });
	return Object.keys(r).map(x => ({ id: x, ...r[x] })).sort((a, b) => a.id - b.id);
}