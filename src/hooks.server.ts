import { getLoggerHook } from '$lib/index.js';

export const handle = getLoggerHook({
	template: '{date} {url} {method} {status}',
	colorOptions: {
		date: 'yellow',
		url: 'default',
		urlSearchParams: 'default'
	}
});
