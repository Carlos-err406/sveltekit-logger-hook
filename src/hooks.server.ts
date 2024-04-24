import { getLoggerHook } from '$lib/index.js';

export const handle = getLoggerHook({
	template: '{date} [{url}{urlSearchParams}] [{method} {status}]',
	colorOptions: {
		date: ({ status }) => (status >= 400 ? 'red' : 'yellow'),
		status: ({ status }) => (status >= 400 ? 'redBold' : 'green'),
		method: ({ status }) => (status >= 400 ? 'red' : 'green'),
		url: ({ status }) => (status >= 400 ? 'red' : 'yellow'),
		urlSearchParams: ({ status }) => (status >= 400 ? 'red' : 'yellow')
	}
});
