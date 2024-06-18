import type { Handle } from '@sveltejs/kit';
import dayjs from 'dayjs';
import fs from 'fs';
const colorDefault = (text: string) => `\x1b[0m${text}\x1b[0m`;

const colorRed = (text: string) => `\x1b[31m${text}\x1b[0m`;
const colorGreen = (text: string) => `\x1b[32m${text}\x1b[0m`;
const colorYellow = (text: string) => `\x1b[33m${text}\x1b[0m`;
const colorCyan = (text: string) => `\x1b[36m${text}\x1b[0m`;
const colorCyanBold = (text: string) => `\x1b[1;36m${text}\x1b[0m`;
const colorRedBold = (text: string) => `\x1b[1m\x1b[31m${text}\x1b[0m`;
const colorGreenBold = (text: string) => `\x1b[1m\x1b[32m${text}\x1b[0m`;
const colorYellowBold = (text: string) => `\x1b[1m\x1b[33m${text}\x1b[0m`;

const logToConsole = (...text: string[]) => process.stdout.write(text.join(' ') + '\n');

export const Colors = {
	default: colorDefault,
	red: colorRed,
	green: colorGreen,
	yellow: colorYellow,
	cyan: colorCyan,
	cyanBold: colorCyanBold,
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
	[key in CleanTemplatePart]?:
		| ((values: CleanLogVariables) => ColorFunctionName)
		| ColorFunctionName;
};

type LoggerHookOptions = {
	template: string;
	dateTemplate?: string;
	fileOptions?: {
		basePath: string;
	};
	colorOptions?: ColorOptions;
	decodeSearchParams?: boolean;
};
const getLogVariables = ({
	method,
	status,
	pathname,
	search,
	decodeSearchParams
}: {
	method: string;
	decodeSearchParams: boolean;
	status: number;
	pathname: string;
	search: string;
}): LogVariables => ({
	'{date}': new Date(),
	'{method}': method,
	'{status}': status,
	'{urlSearchParams}': decodeSearchParams ? decodeURIComponent(search) : search,
	'{url}': pathname
});
const getCleanLogVariables = (logVariables: LogVariables): CleanLogVariables => ({
	date: logVariables['{date}'],
	method: logVariables['{method}'],
	status: logVariables['{status}'],
	url: logVariables['{url}'],
	urlSearchParams: logVariables['{urlSearchParams}']
});

const getStrLogs = (
	template: string,
	{
		dateTemplate = 'YYYY-MMMM-DD HH:mm:ss A',
		logVariables,
		cleanLogVariables,
		colorOptions
	}: {
		dateTemplate?: string;
		logVariables: LogVariables;
		cleanLogVariables: CleanLogVariables;
		colorOptions: ColorOptions;
	}
) =>
	Object.entries(logVariables).reduce(
		(acc, [key, value]) => {
			const k = key.replaceAll(new RegExp(/[{}]/, 'g'), '') as CleanTemplatePart;
			const color = colorOptions[k];
			let coloredValue = '';
			const formattedValue =
				value instanceof Date ? dayjs(value).format(dateTemplate) : String(value);
			if (typeof color === 'function') {
				const colorName = color(cleanLogVariables);
				const paint = Colors[colorName];
				coloredValue = paint(String(formattedValue));
			} else {
				coloredValue = Colors[color || 'default'](formattedValue);
			}
			acc.rawLog = acc.rawLog.replaceAll(key, formattedValue);
			acc.coloredLog = acc.coloredLog.replaceAll(key, coloredValue);
			return acc;
		},
		{ coloredLog: template, rawLog: template }
	);
export const getLoggerHook =
	({
		template,
		dateTemplate,
		fileOptions,
		colorOptions = {
			url: 'default',
			date: 'default',
			method: 'default',
			status: 'default',
			urlSearchParams: 'default'
		},
		decodeSearchParams = false
	}: LoggerHookOptions): Handle =>
	async ({ event, resolve }) => {
		const { url, request } = event;
		const response = await resolve(event);
		const { status } = response;
		const { method } = request;
		const { pathname, search } = url;
		const logVariables = getLogVariables({ method, status, pathname, search, decodeSearchParams });
		const cleanLogVariables = getCleanLogVariables(logVariables);
		const { coloredLog, rawLog } = getStrLogs(template, {
			logVariables,
			dateTemplate,
			cleanLogVariables,
			colorOptions
		});
		logToConsole(coloredLog);
		logToFile(rawLog, fileOptions);
		return response;
	};

const logToFile = (line: string, fileOptions: LoggerHookOptions['fileOptions']): void => {
	if (!fileOptions) return;
	const fileName = dayjs().format('YYYY-MM-DD');
	const { basePath } = fileOptions;
	const path = `${basePath}/${fileName}.log`;
	fs.appendFileSync(path, line + '\n');
};

export const appendToLog = (
	content: string,
	fileOptions: LoggerHookOptions['fileOptions']
): void => {
	if (!fileOptions) return;
	const fileName = dayjs().format('YYYY-MM-DD');
	const { basePath } = fileOptions;
	const path = `${basePath}/${fileName}.log`;
	fs.appendFileSync(path, content + '\n');
};

export const log = <T extends object = object>(
	content: string | T,
	fileOptions?: LoggerHookOptions['fileOptions']
) => {
	if (typeof content === 'string') {
		logToConsole(content);
		if (fileOptions) {
			appendToLog(content, fileOptions);
		}
	} else {
		logToConsole(JSON.stringify(content, null, 2));
		if (fileOptions) {
			appendToLog(JSON.stringify(content, null, 2), fileOptions);
		}
	}
};
