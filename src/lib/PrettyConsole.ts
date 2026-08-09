import util from 'node:util';

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
  /** log level
   *  Valid values: 'trace', 'debug', 'info', 'warn', 'error', 'fatal'
   *  Level order: 'trace' < 'debug' < 'info' < 'warn' < 'error' < 'fatal'
   *  - 'trace':  Output logs for all levels
   *  - 'debug':  Output logs for 'debug' and higher levels
   *  - 'info':   Output logs for 'info' and higher levels (default)
   *  - 'warn':   Output logs for 'warn' and higher levels
   *  - 'error':  Output logs for 'error' and 'fatal' levels
   *  - 'fatal':  Output logs only for the 'fatal' level
   */
  level: LogLevel;

  /** If set to `true`, the timestamp is output. */
  timestamp: boolean;

  /** If set to `true`, the log level name 
   * (TRACE, DEBUG, INFO, WARN, ERROR, FATAL) is output. */
  levelName: boolean

  /** If set to `true`, the call stack is added to `trace`-level logs. */
  callStack: boolean;

  /** Specifies the number of stack frames collected by a stack trace. */
  stackTraceLimit: number;

  /** A substitute for the console */
  provider : LogProvider;

  /**
   * The length at which input values are split across multiple lines.
   * Set to Infinity to format the input as a single line
   * (in combination with compact set to true or any number >= 1).
   */
  breakLength: number;

  /**
   * If set to `true`, the output is styled with ANSI color codes.
   * Colors are customizable. See {@link https://nodejs.org/api/util.html#customizing-utilinspect-colors Customizing util.inspect colors}. 
   */
  colors: boolean;

  /**
   * Setting this to false causes each object key to be displayed on a new line.
   *  It will break on new lines in text that is longer than breakLength.
   *  If set to a number, the most n inner elements are united on a single line
   *  as long as all properties fit into breakLength.
   *  Short array elements are also grouped together.
   */
  compact: boolean | number;

  /**
   * Specifies the maximum recursion depth for nested objects.
   * Use null to inspect all levels recursively.
   */
  depth: number | null;

  /**
   * Specifies the maximum number of Array, TypedArray, Map, WeakMap, and WeakSet
   *  elements to include when formatting. Set to null or Infinity to show all elements.
   *  Set to 0 or negative to show no elements. 
   *  For more information, see the description of
   *  {@link https://nodejs.org/api/util.html#utilinspectobject-options util.inspect() Configuration Options}.
   */
  maxArrayLength: number | null;

  /**
   * Specifies the maximum number of characters to include when formatting.
   * Set to null or Infinity to show all elements.
   * Set to 0 or negative to show no characters.
   */
  maxStringLength: number | null;

  /**
   * If set to `true` or a `function`, all properties of an object,
   * and Set and Map entries are sorted in the resulting string.
   * If set to `true`, the {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort default sort}
   * is used. If set to a function, it is used as a
   * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#parameters compare function}.
   */
  sorted: boolean | CompareFn;
};

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
   * Ppraivate fields
   */

  /** default configuration */
  private static readonly defaultConf: Config  = {
    level:            'info',
    timestamp:        true,
    levelName:        true,
    callStack:        false,
    stackTraceLimit:  10,
    provider:         console,
    breakLength:      120,
    colors:           true,
    compact:          false,
    depth:            null,
    maxArrayLength:   100,
    maxStringLength:  12800,
    sorted:           true,
  };
  
  /** current configuration */
  private static config = PrettyConsole.defaultConf;

  /**
   * Public methods
   */

  /**
   * Set configuration.
   * @param config  configuration
   */
  public static setConfig(config: Config): void {
    PrettyConsole.config = PrettyConsole.resolvedConfig(config);
  }

  /**
   * Get current configuration.
   */
  public static getConfig(): Config {
    return {...PrettyConsole.config};
  }

  /**
   * Reset current configuration
   */
  public static resetConfig(): void {
    PrettyConsole.config = {...PrettyConsole.defaultConf};
  }

  /**
   * Get detfault configuration.
   */
  public static getDefaultConfig(): Config {
    return {...PrettyConsole.defaultConf};
  }

  private static getLogger() {
    if (PrettyConsole.config.provider) return PrettyConsole.config.provider;
    return console;
    //return !PrettyConsole.config.provider ? PrettyConsole.config.provider : console;
  }

  /**
   * Always output information, regardless of the log level.
   * @param args  An array of values ​​to be output.
   */
  public static log(...args: any[]) {
    PrettyConsole.output(null, args, PrettyConsole.getLogger().log);
  }

  /**
   * Output information at the 'trace' level.
   * If 'callStack' is true, the call stack is also output.
   * @param args  An array of values ​​to be output.
   */
  public static trace(...args: any[]) {
    if (PrettyConsole.config.callStack) {
      args.push('\n' + PrettyConsole.getCallStack());
    }
    PrettyConsole.output('trace', args, PrettyConsole.getLogger().debug);
  }

  /**
   * Output information at the 'debug' level.
   * @param args  An array of values ​​to be output.
   */
  public static debug(...args: any[]) {
    PrettyConsole.output('debug', args, PrettyConsole.getLogger().debug);
  }

  /**
   * Output information at the 'info' level.
   * @param args  An array of values ​​to be output.
   */
  public static info(...args: any[]) {
    PrettyConsole.output('info', args, PrettyConsole.getLogger().info);
  }

  /**
   * Output information at the 'warn' level.
   * @param args  An array of values ​​to be output.
   */
  public static warn(...args: any[]) {
    PrettyConsole.output('warn', args, PrettyConsole.getLogger().warn);
  }

  /**
   * Output information at the 'error' level.
   * @param args  An array of values ​​to be output.
   */
  public static error(...args: any[]) {
    PrettyConsole.output('error', args, PrettyConsole.getLogger().error);
  }

  /**
   * Output information at the 'fatal' level.
   * @param args  An array of values ​​to be output.
   */
  public static fatal(...args: any[]) {
    PrettyConsole.output('fatal', args, PrettyConsole.getLogger().error);
  }

  /**
   * Private methods
   */

  /**
   * Check whether to output logs.
   * @param level Log level
   */
  private static shouldLog(level: LogLevel | null): boolean {
    return !level || logLevels[level] >= logLevels[PrettyConsole.config.level];
  }

  /**
   * Validate the configuration settings and assign default values ​​to any unspecified settings.
   * @param config  
   * @returns Resolved configuration
  */
  private static resolvedConfig(config: Config): Config {
    const rConf = {...config};
    const checkType = <K extends keyof Config>(key: K , typeChecker: (v: Config[K]) => boolean) => {
      if (Object.hasOwn(config, key)) {
        if (!typeChecker(config[key])) {
          throw new Error(`Type mismatch for config.${key}.`);
        }
      }
    }

    // check type
    const ttttt = typeof config.level;
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

    // fill options with default values, and return.
    return {...PrettyConsole.defaultConf, ...rConf};
  }

  /**
   * Format the values ​​in the array.
   * @param args  An array of values ​​to be output.
   * @returns An array of formatted values ​​to be output.
   */
  private static format(args: any[]): any[] {
    return args.map((value: any) => {
      if (value instanceof Error) {
        return value;
      }
      if (typeof value === "object" && value !== null) {
        return util.inspect(value, PrettyConsole.config);
      }
      return value;
    });
  }

  /**
   * Format a Date instance or UTC time (in milliseconds). 
   * @param date    `Date` instance or UTC time (in milliseconds)
   * @param format  Time string formatting pattern. Example: "YYYY-MM-DD HH:mm:ss.SSS"
   *  - YYYY: Year (4 digits)
   *  - MM: Month (2 digits)
   *  - DD: Day (2 digits)
   *  - HH: Hour (2 digits, 24-hour format)
   *  - mm: Minute (2 digits)
   *  - ss: Second (2 digits)
   *  - SSS: Millisecond (3 digits)
   * @returns {string}
   */
  private static formatDate(date: Date | number, format: string = "YYYY-MM-DD HH:mm:ss.SSS") {
    format = format || "YYYY-MM-DD HH:mm:ss.SSS";
    date = new Date(date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 0-11 → 1-12
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    const ms = date.getMilliseconds();

    const pad2 = (n: number) => String(n).padStart(2, "0");
    const pad3 = (n: number) => String(n).padStart(3, "0");

    return format
      .replace(/YYYY/g, String(year))
      .replace(/MM/g, pad2(month))
      .replace(/DD/g, pad2(day))
      .replace(/HH/g, pad2(hour))
      .replace(/mm/g, pad2(minute))
      .replace(/ss/g, pad2(second))
      .replace(/SSS/g, pad3(ms));
  }

  /**
   * Add a prefix to the array of output values.
   * @param args  An array of values ​​to be output.
   * @param level Log level
   * @returns An array of output values ​​with a prefix added.
   */
  private static addPrefixes(args: any[], level: LogLevel | null): any[] {
    if (level && PrettyConsole.config.levelName) args.unshift(`${level.toUpperCase()}:`);
    if (PrettyConsole.config.timestamp) args.unshift(`[${PrettyConsole.formatDate(Date.now())}]`);
    return args;
  }

  /**
   * output log
   * @param level Log level
   * @param args  An array of values ​​to be output.
   * @param logFn Function to output the log.
   */
  private static output(level: LogLevel | null, args: any[], logFn: (...a: any[]) => void): void {
    if (PrettyConsole.shouldLog(level)) {
      logFn(...PrettyConsole.format(PrettyConsole.addPrefixes(args, level)));
    }
  }

  /**
   * Get the call stack.
   */
  private static getCallStack(): string {
    const prev = Error.stackTraceLimit;
    Error.stackTraceLimit = PrettyConsole.config.stackTraceLimit;
    const err = new Error('');
    Error.stackTraceLimit = prev;  
    err.stack = err.stack ? err.stack.replace('Error', 'Call stack') : `Call stack: couldn't get`;
    return err.stack;  
  }

}

