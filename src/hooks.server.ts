import { getLoggerHook } from '$lib/index.js';

export const handle = getLoggerHook({
	template: '{date} {url} {method} {status}',
	dateTemplate:"[dayjs-date] YYYY-MM-DD HH:mm:ss A",
	fileOptions: {
		basePath: './logs'
	},
	colorOptions: {
		date: 'yellow',
		url: 'default',
		urlSearchParams: 'default'
	}
});
