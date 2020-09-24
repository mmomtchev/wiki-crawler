'use strict';
import * as wiki from './wiki.mjs';

const result = {};

(async function getPage(id, level) {
	const links = await wiki.linksHere(id);
	for (const page of links) {
		if (result[page] === undefined) {
			result[page] = {
				links: 0
			}
			result[page].title = (await wiki.info(page)).title;
		}
		result[page].links++;
		if (level > 0)
			await getPage(page, level - 1);
	}
})(wiki.main, wiki.depth)
	.then(() => console.log(wiki.sort(result)));