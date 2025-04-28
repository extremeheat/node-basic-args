# basic-args
[![NPM version](https://img.shields.io/npm/v/basic-args.svg)](http://npmjs.com/package/basic-args)
[![Build Status](https://github.com/extremeheat/node-basic-args/workflows/CI/badge.svg)](https://github.com/extremeheat/node-basic-args/actions?query=workflow%3A%22CI%22)
[![Discord](https://img.shields.io/badge/chat-on%20discord-brightgreen.svg)](https://discord.gg/GsEFRM8)
[![Try it on gitpod](https://img.shields.io/badge/try-on%20gitpod-brightgreen.svg)](https://gitpod.io/#https://github.com/extremeheat/node-basic-args)

Basic argument parsing library using yargs-parser with built-in help screen

## Features
- Flagged arguments (e.g., `--version`) with types, descriptions, aliases, and defaults.
- Positional arguments
- Help screen: Automatically generated with positionals, options, and user-defined usage examples.
- Extraneous arguments are stored in the `_` property unless `errorOnExtra` is `true`.
- Validation: Optional `validate` hook to check yargs parsed arguments before returning.
- Preprocessing: Optional `preprocess` hook to modify raw arguments before parsing.

## Installation

`npm install basic-args`

## Usage

See `index.d.ts` for the full API.

#### CommonJS Import

```js
const args = require('basic-args')({
  name: 'basic-args-example',
  version: '1.0.0',
  description: 'A basic example of basic-args',
  options: {
    version: { type: String, description: 'Version to connect as', alias: 'v' },
    port: { type: Number, description: 'Port to listen on', default: 25565 },
    online: { type: Boolean, description: 'Whether to run in online mode' },
    path: { type: String, description: 'Path to the server directory', default: '.' }
  },
  positionals: [
    { name: 'input', type: String, description: 'Input file path' },
    { name: 'output', type: String, description: 'Output file path' }
  ]
})

console.log(args)
```

Running the above with `basic-args-example input.txt output.txt --version 1.16` (or using `-v 1.16`) yields:

```js
{ input: 'input.txt', output: 'output.txt', version: '1.16', port: 25565, online: false, path: '.' }
```

#### Help Screen
Running with `--help` (or the configured `helpCommand`) displays the help screen:

```
basic-args-example - v1.0.0
A basic example of basic-args

Positionals:
  input     Input file path
  output    Output file path

Options:
  --version, -v Version to connect as
  --port        Port to listen on  (default: 25565)
  --online      Whether to run in online mode
  --path        Path to the server directory  (default: .)

Usage:
  basic-args-example input.txt output.txt --version 1.16  Start server with version 1.16
  basic-args-example input.txt output.txt --port 8080      Start server on port 8080
  basic-args-example input.txt output.txt --online        Start server in online mode
```

### Configuration
- `name`: Program name (shown in help).
- `version`: Program version (shown in help).
- `description`: Program description (shown in help).
- `options`: Object mapping option names to `{ type, description, alias?, default? }`.
- `positionals`: Array of `{ name, type, description? }` for required positional arguments.
- `examples`: Array of strings for usage examples in the help screen.
- `errorOnExtra`: If `true`, errors on unrecognized options (default: `false`).
- `throwOnError`: If `true`, throws errors instead of exiting (default: `false`).
- `helpCommand`: Command to trigger help screen (default: `help`).
- `preprocess`: Function to preprocess raw arguments.
- `validate`: Function to validate parsed arguments.

### Notes
- Positional arguments are required and must match the order and number defined in `positionals`.
- Extra positional arguments are stored in `_` unless `errorOnExtra` is `true`.
- Boolean options don’t accept values (e.g., `--online` is `true`, not `--online true`). Use `String` type for custom handling.
- Use the second argument to pass custom args instead of `process.argv`:

```js
require('basic-args')(options, ['--version', '1.16'])
```

#### ES6 Import
```js
import basicArg from 'basic-args'
const args = basicArg({
  name: 'basic-args-example',
  version: '1.0.0',
  description: 'A basic example of basic-args',
  throwOnError: false,
  helpCommand: 'help',
  options: {
    version: { type: String, description: 'Version to connect as', alias: 'v' },
    port: { type: Number, description: 'Port to listen on', default: 25565 },
    online: { type: Boolean, description: 'Whether to run in online mode' },
    path: { type: String, description: 'Path to the server directory', default: '.' }
  },
  positionals: [
    { name: 'input', type: String, description: 'Input file path' },
    { name: 'output', type: String, description: 'Output file path' }
  ],
  examples: [
    'basic-args-example input.txt output.txt --version 1.16  Start server with version 1.16',
    'basic-args-example input.txt output.txt --port 8080      Start server on port 8080',
    'basic-args-example input.txt output.txt --online        Start server in online mode'
  ]
})
```

## Testing

```npm test```

## History

See [history](HISTORY.md)
