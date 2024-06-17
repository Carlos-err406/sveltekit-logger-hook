import { getLoggerHook } from '$lib/index.js';

export const handle = getLoggerHook({
	template: '{date} {url} {method} {status}',
	fileOptions: {
		basePath: './logs'
	},
	colorOptions: {
		date: 'yellow',
		url: 'default',
		urlSearchParams: 'default'
	}
});
