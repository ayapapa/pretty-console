[![CI](https://github.com/ayapapa/pretty-console/actions/workflows/ci.yml/badge.svg)](https://github.com/ayapapa/pretty-console/actions/workflows/ci.yml)
# pretty-console-js

A tiny wrapper around the standard Node.js `console`.

## Why?

While developing Node.js libraries, I found myself using `console` for most debugging tasks because it is simple and always available. However, I often wanted a few extra features without introducing a full-featured logging framework.

So I created **pretty-console**.

It keeps the familiar `console` API while adding a few small conveniences for everyday development.

## Features

* Deeply nested objects are displayed using [`util.inspect()`](https://nodejs.org/api/util.html#utilinspectobject-options).
* Supports configurable log levels (`'trace'`, `'debug'`, `'info'`, `'warn'`, `'error'`, and `'fatal'`).
* Optional timestamps.
* Optional colored output.
* Configurable formatting options.
* Lightweight with no external runtime dependencies.

The goal is **not** to replace logging frameworks such as [Pino](https://www.npmjs.com/package/pino) or [Winston](https://www.npmjs.com/package/winston), but to make the built-in `console` more pleasant to use during development.

## Installation

```bash
npm install @ayapapa-npm/pretty-console-js
```

## Configurations
Set the output configuration using `PrettyConsole.setConfig()`.

Key configuration options.
The `breakLength` option and what follows are options that are passed directly 
to the Configuration Options of [`util.inspect()`](https://nodejs.org/api/util.html#utilinspectobject-options). You can also specify 
Configuration Options for util.inspect() that are not described here. 
For more information, see the description of 
[`util.inspect()` Configuration Options](https://nodejs.org/api/util.html#utilinspectobject-options).

| option        | Type | Description        | Default                |
| ------------- | --------- | --------- | ---------------- |
| `level`       | `string` | The minimum log level to display. Valid values: `'trace'`, `'debug'`, `'info'`, `'warn'`, `'error'`, `'fatal'`. Order: `'trace'` < `'debug'` < `'info'` < `'warn'` < `'error'` < `'fatal'` | `'info'`      |
| `timestamp`   | `boolean` | If `true`, includes a timestamp in the output. | `true` |
| `levelName`   | `boolean` | If `true`, includes the log level name (e.g., TRACE, DEBUG). | `true` |
| `callStack`   | `boolean` | If `true`, includes the call stack for `trace`-level logs. | `false` |
| `stackTraceLimit` | `number` | Specifies the number of stack frames to output in the stack trace. If a non-numeric value or a negative number is specified, the stack trace will not output any frames. | `10` |
| `breakLength` | `number`  | The length at which input values are split across multiple lines. Set to Infinity to format the input as a single line (in combination with compact set to true or any number >= 1). | `120` |
| `colors`      | `boolean` | If `true`, the output is styled with ANSI color codes. Colors are customizable. See [Customizing util.inspect colors](https://nodejs.org/api/util.html#customizing-utilinspect-colors). | `true` |
| `compact`     | `boolean` or `number` | If `false`, each object key is displayed on a new line, and text longer than `breakLength` is broken. If a number is specified, up to `n` inner elements are combined on a single line if they fit within `breakLength`. Short array elements are also grouped. | `false` |
| `depth` | `number` or `null` | Sets the maximum recursion depth for nested objects. Use `null` to inspect all levels. | `null` |
| `maxArrayLength` | `number` or `null` | Sets the maximum number of Array, TypedArray, Map, WeakMap, and WeakSet elements to include. Use `null` or `Infinity` to show all elements. Use `0` or a negative number to show no elements. | `100` |
| `maxStringLength` | `number` or `null` | Sets the maximum number of characters to include when formatting. Use `null` or `Infinity` to show all characters. Use `0` or a negative number to show no characters. | `12800` |
| `sorted`      | `boolean` or `function` | If `true` or a function, all properties of an object, and Set and Map entries are sorted in the resulting string. If `true`, the [default sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) is used. If a function is provided, it is used as a [compare function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#parameters). | `true` |

## Usage

```javascript
import { PrettyConsole } from '@ayapapa-npm/pretty-console-js';
// CommonJS:
// const { PrettyConsole } = require('@ayapapa-npm/pretty-console-js');

// Create instance
const logger = new PrettyConsole({ level: 'trace', callStack: true });

function someFunc(x, y, z) {
  logger.trace('enter someFunc', 'args: ', 'x =', x, 'y =', y, 'z =', z);

  const obj = { jjj: true, iii: 123, hhh: 'hello', next: { ggg: "goodbye", ddd: "yesterday", yyy: 1998.092 } };
  logger.info(obj);

  const result = x * y - z;
  logger.debug("result =", result);

  try {
    throw new Error("Error!!");
  }
  catch (err) {
    logger.error("Error occuered.", err);
  }

  return result;
}

function main() {
  const res = someFunc(1, 2, 3);
  logger.log("someFunc() returns:", res);
}

main();
```
Execution results:<br>
![Execution results](./images/usage1.png)
