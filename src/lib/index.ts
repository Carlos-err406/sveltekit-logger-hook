import type { Handle } from '@sveltejs/kit';

const colorDefault = (text: string) => `\x1b[0m${text}\x1b[0m`;

const colorRed = (text: string) => `\x1b[31m${text}\x1b[0m`;
const colorGreen = (text: string) => `\x1b[32m${text}\x1b[0m`;
const colorYellow = (text: string) => `\x1b[33m${text}\x1b[0m`;
const colorRedBold = (text: string) => `\x1b[1m\x1b[31m${text}\x1b[0m`;
const colorGreenBold = (text: string) => `\x1b[1m\x1b[32m${text}\x1b[0m`;
const colorYellowBold = (text: string) => `\x1b[1m\x1b[33m${text}\x1b[0m`;
const log = (...text: string[]): void => process.stdout.write(text.join(' ') + '\n');

export const Colors = {
	default: colorDefault,
	red: colorRed,
	green: colorGreen,
	yellow: colorYellow,
	redBold: colorRedBold,
	greenBold: colorGreenBold,
	yellowBold: colorYellowBold
} as const;

type ColorFunctionName = keyof typeof Colors;
type TemplatePart = '{date}' | '{method}' | '{status}' | '{url}' | '{urlSearchParams}';
type CleanTemplatePart = 'date' | 'method' | 'status' | 'url' | 'urlSearchParams';

type LogVariableType<T = TemplatePart> = T extends '{date}'
	? Date
	: T extends '{status}'
		? number
		: string;

type CleanLogVariableType<T = TemplatePart> = T extends 'date'
	? Date
	: T extends 'status'
		? number
		: string;

type LogVariables = {
	[key in TemplatePart]: LogVariableType<key>;
};

type CleanLogVariables = {
	[key in CleanTemplatePart]: CleanLogVariableType<key>;
};

type ColorOptions = {
	[key in CleanTemplatePart]:
		| ((values: CleanLogVariables) => ColorFunctionName)
		| ColorFunctionName;
};

type LoggerHookOptions = {
	template: string;
	colorOptions?: ColorOptions;
};

export const getLoggerHook =
	({
		template,
		colorOptions = {
			url: 'default',
			date: 'default',
			method: 'default',
			status: 'default',
			urlSearchParams: 'default'
		}
	}: LoggerHookOptions): Handle =>
	async ({ event, resolve }) => {
		const { url, request } = event;
		const response = await resolve(event);
		const { status } = response;
		const { method } = request;
		const { pathname, search } = url;
		const logVariables: LogVariables = {
			'{date}': new Date(),
			'{method}': method,
			'{status}': status,
			'{urlSearchParams}': search,
			'{url}': pathname
		};
		const cleanLogVariables: CleanLogVariables = {
			date: logVariables['{date}'],
			method: logVariables['{method}'],
			status: logVariables['{status}'],
			url: logVariables['{url}'],
			urlSearchParams: logVariables['{urlSearchParams}']
		};
		const str = Object.entries(logVariables).reduce((acc, [key, value]) => {
			const k = key.replaceAll(new RegExp(/[{}]/, 'g'), '') as CleanTemplatePart;
			const color = colorOptions[k];
			let coloredValue = String(value);
			if (value instanceof Date) coloredValue = value.toLocaleString();
			if (typeof color === 'function') {
				const colorName = color(cleanLogVariables);
				const getColor = Colors[colorName];
				coloredValue = getColor(String(value));
			} else coloredValue = Colors[color](String(value));
			return acc.replaceAll(key, coloredValue);
		}, template);

		log(str);

		return response;
	};
