import util from 'node:util';
import { DateFormatter } from '@ayapapa-npm/date-formatter-js';

/** Log levels */
const logLevels = {
  trace:  10,
  debug:  20,
  info:   30,
  warn:   40,
  error:  50,
  fatal:  60 
} as const;

/** Log level type */
export type LogLevel = keyof typeof logLevels; 

/** Compare function type */
export type CompareFn = <T>(a: T, b: T) => number;

/** Type of the console replacement object */
export type LogProvider = Pick<Console,  'log' | 'error' | 'warn' | 'info' | 'debug'>;

/**
 * configuration definition. 
 * The 'breakLength' option and what follows are options that are passed directly
 * to the Configuration Options of util.inspect(). You can also specify 
 * Configuration Options for util.inspect() that are not described here.
 * For more information, see the description of
 * {@link https://nodejs.org/api/util.html#utilinspectobject-options util.inspect() Configuration Options}.
 */
export interface Config {
  /**
   * Desired logging level. 
   * In order of priority, available levels are:
   *  - 'trace':  Output logs for all levels.
   *  - 'debug':  Output logs for 'debug' and higher levels.
   *  - 'info':   Output logs for 'info' and higher levels.
   *  - 'warn':   Output logs for 'warn' and higher levels.
   *  - 'error':  Output logs for 'error' and 'fatal' levels.
   *  - 'fatal':  Output logs only for the 'fatal' level.
   * If omitted, defaults to `'info'`.
   */
  level?: LogLevel;

  /**
   * Whether to output timestamps. 
   * If set to `true`, the timestamp is output.
   * If omitted, defaults to `true`.
   */
  timestamp?: boolean;

  /**
   * Whether to output logging level name. 
   * If set to `true`, the log level name 
   * (`TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL`) is output.
   * If omitted, defaults to `true`.
   */
  levelName?: boolean

  /**
   * Whether to output the call stack in `trace()`. 
   * If set to `true`, the call stack is added to `trace`-level logs. 
   * If omitted, defaults to `false`.
   */
  callStack?: boolean;

  /**
   * Upper limit on the number of stack frames. 
   * Specifies the number of stack frames collected by a stack trace.
   * If omitted, defaults to `10`.
   */
  stackTraceLimit?: number;

  /**
   * Alternative to `console`.
   * If omitted, `console` is used.
   */
  provider? : LogProvider;

  /**
   * Specifies the length at which input values are split across multiple lines.
   * Set to Infinity to format the input as a single line
   * (in combination with compact set to true or any number >= 1).
   * If omitted, default to `120`.
   */
  breakLength?: number;

  /**
   * Whether to color the output. 
   * If set to `true`, the output is styled with ANSI color codes.
   * Colors are customizable. See {@link https://nodejs.org/api/util.html#customizing-utilinspect-colors Customizing util.inspect colors}. 
   * If omitted, default to `true`.
   */
  colors?: boolean;

  /**
   * Whether to make the object output compact.
   * Setting this to false causes each object key to be displayed on a new line.
   * It will break on new lines in text that is longer than breakLength.
   * If set to a number, the most n inner elements are united on a single line
   * as long as all properties fit into breakLength.
   * Short array elements are also grouped together.
   * If omitted, default to `false`.
   */
  compact?: boolean | number;

  /**
   * Specifies the maximum recursion depth for nested objects.
   * Use null to inspect all levels recursively.
   * If omitted, default to `null`.
   */
  depth?: number | null;

  /**
   * Specifies the maximum number of Array, TypedArray, Map, WeakMap, and WeakSet
   * elements to include when formatting. Set to null or Infinity to show all elements.
   * Set to 0 or negative to show no elements. 
   * For more information, see the description of
   * {@link https://nodejs.org/api/util.html#utilinspectobject-options util.inspect() Configuration Options}.
   * If omitted, default to `100`.
   */
  maxArrayLength?: number | null;

  /**
   * Specifies the maximum number of characters to include when formatting.
   * Set to null or Infinity to show all elements.
   * Set to 0 or negative to show no characters.
   * If omitted, default to `12800`.
   */
  maxStringLength?: number | null;

  /**
   * If set to `true` or a `function`, all properties of an object,
   * and Set and Map entries are sorted in the resulting string.
   * If set to `true`, the {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort default sort}
   * is used. If set to a function, it is used as a
   * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#parameters compare function}.
   * If omitted, default to `true`.
   */
  sorted?: boolean | CompareFn;
};

export type ConfigKey = keyof Config;

/**
 * PrettyConsole, that is a tiny wrapper around the standard Node.js console.
 * 
 * ### Why?
 * 
 * While developing Node.js libraries, I found myself using console for most debugging tasks
 * because it is simple and always available. However, I often wanted a few extra features
 * without introducing a full-featured logging framework.
 * 
 * So I created pretty-console.
 *
 * It keeps the familiar console API while adding a few small conveniences for everyday development.
 * 
 * ### Features
 * 
 * - Displays deeply nested objects using `util.inspect()`.
 * - Supports configurable log levels (`'trace'`, `'debug'`, `'info'`, `'warn'`, `'error'`, and `'fatal'`).
 * - Optional timestamps.
 * - Optional colored output.
 * - Configurable formatting options.
 * - Lightweight with no external runtime dependencies.
 * 
 * The goal is not to replace logging frameworks such as {@link https://www.npmjs.com/package/pino Pino} or {@link https://www.npmjs.com/package/winston Winston}, but to make the built-in console more pleasant to use during development.
 */
export class PrettyConsole {

  /** 
   * Private fields
   */
  /** Default logging leve */
  private static readonly defaultLevel: LogLevel = 'info';

  /** Default stackTraceLimit */
  private static readonly defaultStackTraceLimit: number = 10;

  /** Default configuration */
  private static readonly defaultConf: Config  = {
    level:            PrettyConsole.defaultLevel,
    timestamp:        true,
    levelName:        true,
    callStack:        false,
    stackTraceLimit:  PrettyConsole.defaultStackTraceLimit,
    provider:         console,
    breakLength:      120,
    colors:           true,
    compact:          false,
    depth:            null,
    maxArrayLength:   100,
    maxStringLength:  12800,
    sorted:           true,
  };
  
  /** Current configuration */
  private config: Config = { ...PrettyConsole.defaultConf };

  /**
   * Public methods
   */

  /**
   * @param config
   * @default `PrettyConsole.defaultConf`
   */
  constructor(config: Config = PrettyConsole.defaultConf) {
    this.setConfig(config);
  }

  /**
   * Set configuration.
   * @param config  configuration
   */
  public setConfig(config: Config): void {
    this.config = this.resolvedConfig(config);
  }

  /**
   * Get current configuration.
   * @returns Current configuration.
   */
  public getConfig(): Config {
    return {...this.config};
  }

  /**
   * Reset current configuration
   */
  public resetConfig(): void {
    this.config = {...PrettyConsole.defaultConf};
  }

  /**
   * Get default configuration.
   * @returns Default configuration.
   */
  public static getDefaultConfig(): Config {
    return {...PrettyConsole.defaultConf};
  }

  /**
   * Get default configuration.
   * @returns Default configuration.
   */
  public getDefaultConfig(): Config {
    return PrettyConsole.getDefaultConfig();
  }

  /**
   * Always output information, regardless of the log level.
   * @param args  An array of values ​​to be output.
   */
  public log(...args: any[]) {
    this.output(null, args, this.getLogger().log);
  }

  /**
   * Output information at the 'trace' level.
   * If 'callStack' is true, the call stack is also output.
   * @param args  An array of values ​​to be output.
   */
  public trace(...args: any[]) {
    if (this.config.callStack) {
      const prev = Error.stackTraceLimit;
      Error.stackTraceLimit = this.config.stackTraceLimit ?? PrettyConsole.defaultStackTraceLimit;
      const err = new Error(' ');
      Error.stackTraceLimit = prev;  
      err.stack = err.stack ? err.stack.replace('Error', 'Call stack') : `Call stack: couldn't get`;
      args.push('\n' + err.stack);
    }
    this.output('trace', args, this.getLogger().debug);
  }

  /**
   * Output information at the 'debug' level.
   * @param args  An array of values ​​to be output.
   */
  public debug(...args: any[]) {
    this.output('debug', args, this.getLogger().debug);
  }

  /**
   * Output information at the 'info' level.
   * @param args  An array of values ​​to be output.
   */
  public info(...args: any[]) {
    this.output('info', args, this.getLogger().info);
  }

  /**
   * Output information at the 'warn' level.
   * @param args  An array of values ​​to be output.
   */
  public warn(...args: any[]) {
    this.output('warn', args, this.getLogger().warn);
  }

  /**
   * Output information at the 'error' level.
   * @param args  An array of values ​​to be output.
   */
  public error(...args: any[]) {
    this.output('error', args, this.getLogger().error);
  }

  /**
   * Output information at the 'fatal' level.
   * @param args  An array of values ​​to be output.
   */
  public fatal(...args: any[]) {
    this.output('fatal', args, this.getLogger().error);
  }

  /**
   * Private methods
   */

  /**
   * Check whether to output logs.
   * @param level Log level
   * @returns true if `level` is `null` or `level` >= `level of the current setting`, and false otherwise.
   */
  private shouldLog(level: LogLevel | null): boolean {
    return !level || logLevels[level] >= logLevels[this.config.level ?? PrettyConsole.defaultLevel];
  }

  /**
   * Validate the configuration settings and assign default values ​​to any unspecified settings.
   *
   * @internal
   * @param config  
   * @returns Resolved configuration
  */
  private resolvedConfig(config: Config): Config {
    const rConf = {...config};
    const checkType = <K extends keyof Config>(key: K , typeChecker: (v: Config[K]) => boolean) => {
      if (Object.hasOwn(config, key)) {
        if (!typeChecker(config[key])) {
          throw new TypeError(`Type mismatch for config.${key}.`);
        }
      }
    }

    // Check type
    checkType('level',          (v) => typeof v === 'string' && Object.hasOwn(logLevels, v));
    checkType('timestamp',      (v) => typeof v === 'boolean');
    checkType('levelName',      (v) => typeof v === 'boolean');
    checkType('callStack',      (v) => typeof v === 'boolean');
    checkType('stackTraceLimit',(v) => typeof v === 'number');
    checkType('breakLength',    (v) => typeof v === 'number');
    checkType('colors',         (v) => typeof v === 'boolean');
    checkType('compact',        (v) => typeof v === 'boolean' || typeof v === 'number');
    checkType('depth',          (v) => typeof v === 'number' || v === null);
    checkType('maxArrayLength', (v) => typeof v === 'number' || v === null);
    checkType('maxStringLength',(v) => typeof v === 'number' || v === null);
    checkType('sorted',         (v) => typeof v === 'boolean' || typeof v === 'function');

    // Fill options with default values, and return.
    return {...PrettyConsole.defaultConf, ...rConf};
  }

  /**
   * Format the values ​​in the array.
   * 
   * @internal
   * @param args  An array of values ​​to be output.
   * @returns An array of formatted values ​​to be output.
   */
  private format(args: any[]): any[] {
    return args.map((value: any) => {
      if (value instanceof Error) {
        return value;
      }
      if (typeof value === "object" && value !== null) {
        return util.inspect(value, this.config);
      }
      return value;
    });
  }

  /**
   * Format a Date instance or UTC time (in milliseconds). 
   * 
   * @internal
   * @param date    `Date` instance or UTC time (in milliseconds)
   * @returns A formatted datetime string.
   */
  private formatDate(date: Date | number) {
    return DateFormatter.format(new Date(date), "yyyy-MM-dd HH:mm:ss.fff");
  }

  /**
   * Add a prefix to the array of output values.
   * 
   * @internal
   * @param args  An array of values ​​to be output.
   * @param level Log level
   * @returns An array of output values ​​with a prefix added.
   */
  private addPrefixes(args: any[], level: LogLevel | null): any[] {
    if (level && this.config.levelName) args.unshift(`${level.toUpperCase()}:`);
    if (this.config.timestamp) args.unshift(`[${this.formatDate(Date.now())}]`);
    return args;
  }

  /**
   * Output log
   * 
   * @internal
   * @param level Log level
   * @param args  An array of values ​​to be output.
   * @param logFn Function to output the log.
   */
  private output(level: LogLevel | null, args: any[], logFn: (...a: any[]) => void): void {
    if (this.shouldLog(level)) {
      logFn(...this.format(this.addPrefixes(args, level)));
    }
  }

  /**
   * Get logger obect
   * 
   * @internal
   */
  private getLogger(): LogProvider {
    return this.config.provider ? this.config.provider : console;
  }

}

