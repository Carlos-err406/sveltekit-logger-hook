import { log } from '$lib/index.js';
import { error, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	try {
		throw error(400, 'Custom error to log');
	} catch (e) {
		const errorId = crypto.randomUUID();
		log({ errorId, error: e }, { basePath: './logs' });
		throw e;
	}
};
