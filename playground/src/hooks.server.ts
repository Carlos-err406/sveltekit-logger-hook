import { getLoggerHook } from 'sveltekit-logger-hook';

export const handle = getLoggerHook({
	template: '{date} {url} {method} {status}',
	colorOptions: {
		date:()=> 'yellow',
		method: 'green',
		status: 'green',
		url: 'default',
		urlSearchParams: 'default'
	}
});
