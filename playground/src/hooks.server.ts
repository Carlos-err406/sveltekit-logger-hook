import { getLoggerHook } from 'sveltekit-logger-hook';

export const handle = getLoggerHook({
	template: '{date} {url} {method} {status}',
	colorOptions: {
		date: 'yellow',
		url: 'default',
		urlSearchParams: 'default'
	}
});
