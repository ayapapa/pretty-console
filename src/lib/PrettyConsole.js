'use strict';

 import util from 'node:util';

  /**
   * configuration definition. 
   * The 'breakLength' option and what follows are options that are passed directly
   * to the Configuration Options of util.inspect(). You can also specify 
   * Configuration Options for util.inspect() that are not described here.
   * For more information, see the description of
   * {@link https://nodejs.org/api/util.html#utilinspectobject-options util.inspect() Configuration Options}.
   * 
   * @typedef {object}  Config
   * @property {string} [level='info']  log level
   *  Valid values: 'trace', 'debug', 'info', 'warn', 'error', 'fatal'
   *  Level order: 'trace' < 'debug' < 'info' < 'warn' < 'error' < 'fatal'
   *  - 'trace':  Output logs for all levels
   *  - 'debug':  Output logs for 'debug' and higher levels
   *  - 'info':   Output logs for 'info' and higher levels (default)
   *  - 'warn':   Output logs for 'warn' and higher levels
   *  - 'error':  Output logs for 'error' and 'fatal' levels
   *  - 'fatal':  Output logs only for the 'fatal' level
   * @property {boolean}        [timestamp=true]
   *  If set to `true`, the timestamp is output.
   * @property {boolean}        [levelName=true]
   *  If set to `true`, the log level name (TRACE, DEBUG, INFO, WARN, ERROR, FATAL) is output.
   * @property {boolean}        [callStack=false]
   *  If set to `true`, the call stack is added to `trace`-level logs.
   * @property {number}         [stackTraceLimit=10]
   *  Specifies the number of stack frames collected by a stack trace. 
   * @property {number}         [breakLength=120]
   *  The length at which input values are split across multiple lines.
   *  Set to Infinity to format the input as a single line
   *  (in combination with compact set to true or any number >= 1).
   *  For more information, see the description of
   *  {@link https://nodejs.org/api/util.html#utilinspectobject-options util.inspect() Configuration Options}.
   * @property {boolean}        [colors=true]
   *  If set to `true`, the output is styled with ANSI color codes.
   *  Colors are customizable. See {@link https://nodejs.org/api/util.html#customizing-utilinspect-colors Customizing util.inspect colors}. 
   *  For more information, see the description of
   *  {@link https://nodejs.org/api/util.html#utilinspectobject-options util.inspect() Configuration Options}.
   * @property {boolean|number} [compact=false]
   *  Setting this to false causes each object key to be displayed on a new line.
   *  It will break on new lines in text that is longer than breakLength.
   *  If set to a number, the most n inner elements are united on a single line
   *  as long as all properties fit into breakLength.
   *  Short array elements are also grouped together.
   *  For more information, see the description of
   *  {@link https://nodejs.org/api/util.html#utilinspectobject-options util.inspect() Configuration Options}.
   * @property {number|null}   [depth=null]      
   *  Specifies the maximum recursion depth for nested objects.
   *  Use null to inspect all levels recursively.
   *  For more information, see the description of
   *  {@link https://nodejs.org/api/util.html#utilinspectobject-options util.inspect() Configuration Options}.
   * @property {number|null}   [maxArrayLength=100]  
   *  Specifies the maximum number of Array, TypedArray, Map, WeakMap, and WeakSet
   *  elements to include when formatting. Set to null or Infinity to show all elements.
   *  Set to 0 or negative to show no elements. 
   *  For more information, see the description of
   *  {@link https://nodejs.org/api/util.html#utilinspectobject-options util.inspect() Configuration Options}.
   * @property {number|null}   [maxStringLength=12800] 
   *  Specifies the maximum number of characters to include when formatting.
   *  Set to null or Infinity to show all elements.
   *  Set to 0 or negative to show no characters.
   *  For more information, see the description of
   *  {@link https://nodejs.org/api/util.html#utilinspectobject-options util.inspect() Configuration Options}.
   * @property {boolean|function}  [sorted=true]     
   *  If set to `true` or a `function`, all properties of an object,
   *  and Set and Map entries are sorted in the resulting string.
   *  If set to `true`, the {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort default sort}
   *  is used. If set to a function, it is used as a
   *  {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#parameters compare function}.
   *  For more information, see the description of
   *  {@link https://nodejs.org/api/util.html#utilinspectobject-options util.inspect() Configuration Options}.
   */
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
  static #levels = {
    'trace':  10,
    'debug':  20,
    'info':   30,
    'warn':   40,
    'error':  50,
    'fatal':  60 
  };

  static #defaultConf = {
    level:            'info',
    currentLevel:     PrettyConsole.#levels['info'],
    timestamp:        true,
    levelName:        true,
    callStack:        false,
    stackTraceLimit:  10,
    breakLength:      120,
    colors:           true,
    compact:          false,
    depth:            null,
    maxArrayLength:   100,
    maxStringLength:  12800,
    sorted:           true,
  };
  
  static #config = PrettyConsole.#defaultConf;

  /**
   * 
   * @param {string|null} level 
   * @returns 
   */
  static #shouldLog(level) {
    return !level || PrettyConsole.#levels[level] >= PrettyConsole.#config.currentLevel;
  }

  /**
   * configの内容チェックおよびデフォルト埋め
   * @param {boolean} config.debug      デバッグモードの有効化
  */
  static #resolvedConfig(config) {
    const rConf = {...config};
    const checkType = (key, typeChecker) => {
      if (Object.hasOwn(config, key)) {
        if (!typeChecker(config[key])) {
          throw Error(`Type mismatch for config.${key}.`);
        }
      }
    }

    // check type
    checkType('level',          (v) => typeof v === 'string' && Object.hasOwn(PrettyConsole.#levels, v));
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
    return {...PrettyConsole.#defaultConf, ...rConf, currentLevel: PrettyConsole.#levels[rConf.level]};
  }

  static #format(args) {
    return args.map(value => {

      if (value instanceof Error) {
        return value;
      }

      if (typeof value === "object" && value !== null) {
        return util.inspect(value, PrettyConsole.#config);
      }

      return value;
    });
  }

  /**
   * DateインスタンスまたはUTC(ミリ秒)を整形する 
   * @param {Date | number} date Dateオブジェクトまたはタイムスタンプ（ミリ秒）
   * @param {string} [format]  時間文字列化形式 例: "YYYY-MM-DD HH:mm:ss.SSS"
   *  - YYYY: 年（4桁）
   *  - MM: 月（2桁） 
   *  - DD: 日（2桁）
   *  - HH: 時（2桁、24時間表記）
   *  - mm: 分（2桁）
   *  - ss: 秒（2桁）
   *  - SSS: ミリ秒（3桁）
   * @returns {string}
   */
  static #formatDate(date, format = "YYYY-MM-DD HH:mm:ss.SSS") {
    format = format || "YYYY-MM-DD HH:mm:ss.SSS";
    date = new Date(date); // Dateオブジェクトに変換
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 0-11 → 1-12
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    const ms = date.getMilliseconds();

    // 0埋めユーティリティ
    const pad2 = (n) => String(n).padStart(2, "0");
    const pad3 = (n) => String(n).padStart(3, "0");

    // 置換順に注意: かぶるトークンは長い方から
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
   * set configuration.
   * @param {Config} config node-configオブジェクト
   */
  static setConfig(config) {
    PrettyConsole.#config = PrettyConsole.#resolvedConfig(config);
  }

  /**
   * get current configuration.
   * @returns {Config}
   */
  static getConfig() {
    return PrettyConsole.#refineConfig(PrettyConsole.#config);
  }

  /**
   * get detfault configuration.
   * @returns {Config}
   */
  static getDefaultConfig() {
    return PrettyConsole.#refineConfig(PrettyConsole.#defaultConf);
  }
  static #refineConfig(config) {
    const ret = {};
    delete Object.assign(ret, config).currentLevel;
    return ret;
  }

  static #addPrefixes(args, level) {
    if (level && PrettyConsole.#config.levelName) args.unshift(`${level.toUpperCase()}:`);
    if (PrettyConsole.#config.timestamp) args.unshift(`[${PrettyConsole.#formatDate(Date.now())}]`);
    return args;
  }

  static #output(level, args, logFn) {
    if (PrettyConsole.#shouldLog(level)) {
      logFn(...PrettyConsole.#format(PrettyConsole.#addPrefixes(args, level)));
    }
  }

  /**
   * レベルに関係なく常に情報を出力する
   * @param {...any} args 出力したい値やメッセージ
   */
  static log(...args) {
    PrettyConsole.#output(null, args, console.log);
  }

  /**
   * 'debug'レベルの情報を出力する
　 * @param {...any} args 出力したい値やメッセージ
    */
  static debug(...args) {
    PrettyConsole.#output('debug', args, console.debug);
  }

  /**
   * 'info'レベルの情報を出力する
　 * @param {...any} args 出力対象の値やオブジェクトなど
   */
  static info(...args) {
    PrettyConsole.#output('info', args, console.info);
  }

  /**
   * 'warn'レベルの情報を出力する
　 * @param {...any} args 出力したい値やメッセージ
   */
  static warn(...args) {
    PrettyConsole.#output('warn', args, console.warn);
  }

  /**
   * 'error'レベルの情報を出力する
　 * @param {...any} args 出力したい値やメッセージ
   */
  static error(...args) {
    PrettyConsole.#output('error', args, console.error);
  }

  /**
   * 'trace'レベルの情報を出力する
　 * @param {...any} args 出力したい値やメッセージ
   */
  static trace(...args) {
    if (PrettyConsole.#config.callStack) {
      args.push('\n' + PrettyConsole.#getCallStack());
    }
    PrettyConsole.#output('trace', args, console.debug);
  }

  /**
   * 'trace'レベルの情報を出力する
　 * @param {...any} args 出力したい値やメッセージ
   */
  static fatal(...args) {
    PrettyConsole.#output('fatal', args, console.error);
  }

  #getCallStack() {
    const prev = Error.stackTraceLimit;
    Error.stackTraceLimit = Logger.stackTraceLimit;
    const err = new Error('');
    Error.stackTraceLimit = prev;  
    err.stack = err.stack ? err.stack.replace('Error', 'Call stack:') : `Call stack: couldn't get`;
    return err.stack;  
  }

}

export class Logger extends PrettyConsole {

  /**
   * 検証結果に応じたメッセージを出力する関数。
   * 評価結果がfalseのとき、Errorクラスまたはその継承クラスのインスタンスが指定されていれば例外を投げる。
   * さもなくば `PrettyConsole.error()` により、メッセージを出力する
   * @param   {boolean} isOk      その呼び出し式等の評価結果
   * @param   {string}  [okMsg]   正常時のメッセージ
   * @param   {string}  [ngMsg]   エラーメッセージ
   * @param   {object}  [error]   エラークラス。Error またはその継承クラス
   * @return  {boolean} 評価結果。isOkの値をそのまま返す
   */
  static verify(isOk, okMsg = null, ngMsg = null, error = Error) {
    if (!isOk) {
      if (error) throw new error(ngMsg);
      if (ngMsg) PrettyConsole.error(ngMsg);
    }
    else if (okMsg) {
      PrettyConsole.info(okMsg);
    }
    return isOk;
  }

  /**
   * debug mode
   * @typedef {boolean}
   */ 
  static DEBUG_MODE = false;

  /**
   * trace level
   * @typedef {number}
   */ 
  static TRACE_LEVEL = 0;

  /**
   * 設定
   * @param {Object<string, *>} config node-configオブジェクト
   * @param {boolean} config.debug      デバッグモードの有効化
   * @param {number}  config.traceLevel  トレースレベルの設定。0:全てのTRACE有効、1:TRACE1&TRAC2有効、2:TRACE2のみ有効
   * @param {boolean} config.callStack        トレースログにコールスタック情報を追加する場合はtrue
   * @param {number}  config.stackTraceLimit  コールスタック情報のスタックフレーム数上限
   */
  static setConfig(config) {
    Logger.DEBUG_MODE   = Boolean(config?.debug);
    Logger.TRACE_LEVEL  = (config?.traceLevel) ?? 0;
    super.setConfig({...super.getConfig(), ...config, level: 'trace'});
  }

/**
 * 情報を出力する関数
 * @param {...any} args 出力したい値やメッセージ
 */
static INFO = Logger.info;

/**
 * 情報を出力する関数。
 * 本番コードでは無効化や削除されることを前提とした一時的なログ出力に使う。
 * デバッグモード(Logger.DEBUG_MODE)=trueのときのみ出力する
 * @param {...any} args 出力したい値やメッセージ
 */
static INFO_DEBUG = Logger.debug;

/**
 * エラー情報を出力する関数
 * @param {...any} args 出力したい値やメッセージ
 */
static ERROR = Logger.error;

/**
 * トレース用に情報を出力する関数。
 * 本番コードでは無効化や削除されることを前提とした一時的なログ出力に使う。
 * デバッグモード(Logger.DEBUG_MODE)=trueのときのみ出力する
 * @param {...any} args 出力したい値やメッセージ
 */
static TRACE0 = (...args) => Logger.trace('[LEVEL0]', ...args);

/**
 * レベル1トレース用に情報を出力する関数。
 * 本番コードでは無効化や削除されることを前提とした一時的なログ出力に使う。
 * デバッグモード(Logger.DEBUG_MODE)=true、かつ、トレースレベル(Logger.TRACE_LEVEL)>=1のときのみ出力する
 * @param {...any} args 出力したい値やメッセージ
 */
static TRACE1 = (...args) => {if (Logger.TRACE_LEVEL >= 1) Logger.trace('[LEVEL1]', ...args)};

/**
 * レベル2トレース用に情報を出力する関数。
 * 本番コードでは無効化や削除されることを前提とした一時的なログ出力に使う。
 * デバッグモード(Logger.DEBUG_MODE)=true、かつ、トレースレベル(Logger.TRACE_LEVEL)>=2のときのみ出力する
 * @param {...any} args 出力したい値やメッセージ
 */
static TRACE2 = (...args) => {if (Logger.TRACE_LEVEL >= 2) Logger.trace('[LEVEL2]', ...args)};
}

