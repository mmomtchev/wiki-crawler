'use strict';
import * as wiki from './wiki.mjs';

const result = {};
const linksHereCache = {};

(async function getPage(id, level) {
	if (!linksHereCache[id])
		linksHereCache[id] = wiki.linksHere(id);
	const links = await linksHereCache[id];
	const p = [];
	for (const page of links) {
		if (result[page] === undefined) {
			result[page] = {
				links: 0
			};
			result[page].title = wiki.info(page).then(x => x.title).catch(e => console.error(e));
			p.push(result[page].title);
		}
		result[page].links++;
		if (level > 0)
			p.push(getPage(page, level - 1));
	}
	return Promise.all(p).catch(e => console.error(e));
})(wiki.main, wiki.depth)
	.then(() => console.log(wiki.sort(result)))
	.catch(e => console.error(e));