import { getLoggerHook } from '$lib/index.js';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

const someHook: Handle = ({ event, resolve }) => resolve(event);

const loggerHook = getLoggerHook({
	template: '{date} [{url}{urlSearchParams}] [{method} {status}]',
	colorOptions: {
		date: ({ status }) => (status >= 400 ? 'red' : 'yellow'),
		status: ({ status }) => (status >= 400 ? 'redBold' : 'green'),
		method: ({ status }) => (status >= 400 ? 'red' : 'green'),
		url: ({ status }) => (status >= 400 ? 'red' : 'yellow'),
		urlSearchParams: ({ status }) => (status >= 400 ? 'red' : 'yellow')
	}
});

export const handle = sequence(loggerHook, someHook);
