# pretty-console

A tiny wrapper around the standard Node.js `console`.

## Why?

While developing Node.js libraries, I found myself using `console` for most debugging tasks because it is simple and always available. However, I often wanted a few extra features without introducing a full-featured logging framework.

So I created **pretty-console**.

It keeps the familiar `console` API while adding a few small conveniences for everyday development.

## Features

* Displays deeply nested objects using [`util.inspect()`](https://nodejs.org/api/util.html#utilinspectobject-options).
* Supports configurable log levels (`'trace'`, `'debug'`, `'info'`, `'warn'`, `'error'`, and `'fatal'`).
* Optional timestamps.
* Optional colored output.
* Configurable formatting options.
* Lightweight with no external runtime dependencies.

The goal is **not** to replace logging frameworks such as [Pino](https://www.npmjs.com/package/pino) or [Winston](https://www.npmjs.com/package/winston), but to make the built-in `console` more pleasant to use during development.

## Installation
(under construction)

## Configurations
Set the output configuration using `PrettyConsole.setConfig()`.
Key settings.</br>
The 'breakLength' option and what follows are options that are passed directly 
to the Configuration Options of [`util.inspect()`](https://nodejs.org/api/util.html#utilinspectobject-options). You can also specify 
Configuration Options for util.inspect() that are not described here. 
For more information, see the description of 
[`util.inspect()` Configuration Options](https://nodejs.org/api/util.html#utilinspectobject-options).
| option        | 型 | 内容        | Default                |
| ------------- | --------- | --------- | ---------------- |
| `level`       | `string` | log level</br>Valid values: `'trace'`, `'debug'`, `'info'`, `'warn'`, `'error'`, `'fatal'`</br>Level order: `'trace'` < `'debug'` < `'info'` < `'warn'` < `'error'` < `'fatal'`    | `'info'`      |
| `timestamp`   | `boolean` | If true, the timestamp is output. | `true` |
| `levelName`   | `boolean` | If true, the log level name (`TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL`) is output. | `true` |
| `breakLength` | `number`  | The length at which input values are split across multiple lines.</br>Set to Infinity to format the input as a single line </br>(in combination with compact set to true or any number >= 1). | `120` |
| `colors`      | `boolean` | If true, the output is styled with ANSI color codes. </br>Colors are customizable. See [Customizing util.inspect colors](https://nodejs.org/api/util.html#customizing-utilinspect-colors).  | `true` |
| `compact`     | `boolean` or `number` | Setting this to false causes each object key to be displayed on a new line. </br>It will break on new lines in text that is longer than breakLength. </br>If set to a number, the most n inner elements are united on a single line </br>as long as all properties fit into breakLength. </br>Short array elements are also grouped together.   | `false` |
| `depth` | `number` or `null` | Specifies the maximum recursion depth for nested objects. </br>Use null to inspect all levels recursively.  | `null` |
| `maxArrayLength` | `number` or `null` | Specifies the maximum number of Array, TypedArray, Map, WeakMap, and WeakSet </br>elements to include when formatting. Set to null or Infinity to show all elements. </br>Set to 0 or negative to show no elements.  | `100` |
| `maxStringLength` | `number` or `null` | Specifies the maximum number of characters to include when formatting. </br>Set to null or Infinity to show all elements. </br>Set to 0 or negative to show no characters. | `12800` |
| `sorted`      | `boolean` or `function` | If set to true or a function, all properties of an object, </br>and Set and Map entries are sorted in the resulting string. </br>If set to true the [default sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) is used. </br>If set to a function, it is used as a [compare function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#parameters). | `true` |
