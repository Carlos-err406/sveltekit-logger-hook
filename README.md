# README.md

## Overview

This package provides a customizable logging middleware for SvelteKit applications. It allows developers to colorize and format log messages for HTTP requests and responses, facilitating better readability and debugging experience in server-side logs.

The key feature is the ability to define a log message template with dynamic placeholders for request and response details (such as URL, HTTP method, status code, etc.) and colorize the output using predefined colors.

## Features

- Customizable log message templates
- Dynamic placeholders for request/response details
- Predefined color functions for text colorization
- Supports bold and regular text styles
- Easy integration with SvelteKit's hook system

## Installation

To install the package, run the following command in your SvelteKit project directory:

```bash
npm i sveltekit-logger-hook
```

## Usage

Use the `getLoggerHook` function to generate a logging hook and integrate it into your SvelteKit application's hooks configuration:

```typescript
import { getLoggerHook } from 'sveltekit-logger-hook';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

const someHook: Handle = ({ event, resolve }) => resolve(event);

const loggerHook = getLoggerHook({
	template: '{date} {url} {method} {status}',
	colorOptions: {
		date: 'yellow',
		url: 'default',
		status: ({ status }) => (status >= 400 ? 'redBold' : 'green'),
		urlSearchParams: 'default'
	}
});

export const handle = sequence(loggerHook, someHook);
```

**Observe colorized and formatted log messages**

Start your SvelteKit application, and you should see colorized log messages in your console, formatted according to your template and color settings.

## API Reference

### Colors

A collection of color functions to format log output. Available color functions are:

- `default`
- `red`
- `green`
- `yellow`
- `redBold`
- `greenBold`
- `yellowBold`

### getLoggerHook(options: LoggerHookOptions): Handle

Generates a logging hook for SvelteKit applications.

#### Parameters:

- `options` - Configuration for the log message template and colors.

  - `template`: A string template for log messages. Use placeholders for dynamic content. Available template variables are `{date}`,`{method}`,`{status}`,`{url}`,`{urlSearchParams}`.
  - `colorOptions`: Optional. An object specifying color functions for different parts of the log message. If no value is provided all template parts will have default color. Attributes of this configuration are the same template parts without `{}`, and accept values as direct [color function names](#colors) or a function that takes in the current values of the template parts and return a [color function name](#colors)(see the `status` [example](#usage)) 


#### Return value:

A SvelteKit handle function that can be used in the application's hooks configuration.

## License

This package is licensed under the [MIT License](LICENSE).

## Contributing

Contributions to improve this package are welcome. Please follow the contributing guidelines to submit bugs, feature requests, or pull requests.

## Support

For support and questions, please open an issue in the GitHub repository.

---

This package is not affiliated with or endorsed by Svelte or the SvelteKit project.
