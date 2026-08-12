	import { describe, expect, it, vi, type Mock } from 'vitest';
	import { PrettyConsole, type LogLevel, type Config, type ConfigKey  } from '../src/lib/PrettyConsole.ts';

  type ProviderKey = 'log' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  type Provider = Record<ProviderKey, Mock>;
	
  describe('PrettyConsole', () => {

    const equalConfigs = (c1: Config, c2: Config): boolean => {
      const keys1 = Object.keys(c1) as Array<ConfigKey>;
      const keys2 = Object.keys(c2) as Array<ConfigKey>;

      if (keys1.length !== keys2.length) return false;

      for (const key of keys1) {
        if (c1[key] !== c2[key]) return false;
      }

      return true;
    };

    const checkDefaultCong = (config?: Config) => {
	  	const defConf = config ?? PrettyConsole.getDefaultConfig();
	    expect(defConf.level).toBe('info');
	    expect(defConf.timestamp).toBe(true);
	    expect(defConf.levelName).toBe(true);
      expect(defConf.callStack).toBe(false);
      expect(defConf.stackTraceLimit).toBe(10);
      expect(defConf.breakLength).toBe(120);
      expect(defConf.colors).toBe(true);
      expect(defConf.compact).toBe(false);
      expect(defConf.depth).toBe(null);
      expect(defConf.maxArrayLength).toBe(100);
      expect(defConf.maxStringLength).toBe(12800);
      expect(defConf.sorted).toBe(true);
    }
	
	  it('default configurations are valid', () => {
      checkDefaultCong();
	  });

    const testConf: Config = {
      level: 'trace',
      timestamp: false,
      levelName: false,
      callStack: true,
      stackTraceLimit: 20,
      breakLength: 100,
      colors: false,
      compact: true,
      depth: 3,
      maxArrayLength: 80,
      maxStringLength: 8000,
      sorted: false
      }

    it('set configurations are valid', () => {
      const logger = new PrettyConsole(testConf);
      const conf = logger.getConfig();
	    expect(conf.level).toBe(testConf.level);
	    expect(conf.timestamp).toBe(testConf.timestamp);
	    expect(conf.levelName).toBe(testConf.levelName);
      expect(conf.callStack).toBe(testConf.callStack);
      expect(conf.stackTraceLimit).toBe(testConf.stackTraceLimit);
      expect(conf.breakLength).toBe(testConf.breakLength);
      expect(conf.colors).toBe(testConf.colors);
      expect(conf.compact).toBe(testConf.compact);
      expect(conf.depth).toBe(testConf.depth);
      expect(conf.maxArrayLength).toBe(testConf.maxArrayLength);
      expect(conf.maxStringLength).toBe(testConf.maxStringLength);
      expect(conf.sorted).toBe(testConf.sorted);
	  });

    it('default configurations are invariant', () => {
	  	const defConf = PrettyConsole.getDefaultConfig();
      Object.assign(defConf, testConf);
      checkDefaultCong();
	  });

    it('if reset current configurations, they become default set', () => {
      const logger = new PrettyConsole(testConf);
	  	logger.resetConfig();
      checkDefaultCong(logger.getConfig());
	  });

    it('current configurations are invariant', () => {
      const logger = new PrettyConsole();
	  	let conf = logger.getConfig();
      Object.assign(conf, testConf);
      expect(equalConfigs(logger.getDefaultConfig(), logger.getConfig())).toBe(true);
	  });

    const levelToProviderKey: Record<LogLevel, ProviderKey> = {
      trace: 'debug',
      debug: 'debug',
      info: 'info',
      warn: 'warn',
      error: 'error',
      fatal: 'error',
    };
  
    const createProvider = (): Provider => ({
      log: vi.fn(),
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      fatal: vi.fn(),
    })
  
    const testOutputContents = (
      level: LogLevel,
      msg: string,
      addConf: { callStack?: boolean } = {},
    ): void => {
      const provider: Provider = createProvider();
      const logger = new PrettyConsole({ level, provider, ...addConf });
      logger[level](msg);

      const realKey = levelToProviderKey[level];
      const args = provider[realKey].mock.calls[0];

      expect(args[1]).toContain(level.toUpperCase() + ':');
      expect(args[2]).toContain(msg);

      if (addConf?.callStack) {
        expect(args[3]).toContain('Call stack:');
      }
    };

    it('Output a trace log.', () => {
      testOutputContents('trace', 'trace test', {callStack: true});
    });

    it('Output a debug log.', () => {
      testOutputContents('debug', 'debug test');
    });

    it('Output a info log.', () => {
      testOutputContents('info', 'info test');
    });

    it('Output a warn log.', () => {
      testOutputContents('warn', 'warn test');
    });

    it('Output a error log.', () => {
      testOutputContents('error', 'error test');
    });

    it('Output a fatal error log.', () => {
      testOutputContents('fatal', 'fatal test');
    });

    const checkInvalidProperty = (key: ConfigKey , values: any[]) => {
      const logger = new PrettyConsole();
      values.forEach((v) => {
        const config: Config = {};
        config[key] = v;
        expect(() => logger.setConfig(config)).toThrow(Error);
        expect(() => logger.setConfig(config)).toThrow(`Type mismatch for config.${key}`);
      });
    };

    it('invalid level', () => {
      checkInvalidProperty('level', [undefined, null, 'hoge',  {no: true}, new Error()]);
    });

    it('invalid timestamp', () => {
      checkInvalidProperty('timestamp', [undefined, null, 'hoge', 0, {yes: true}, new Error()]);
    });

    it('invalid levelName', () => {
      checkInvalidProperty('levelName', [undefined, null, 'hoge', 0, {yes: 'no'}, new Error()]);
    });

    it('invalid callStack', () => {
      checkInvalidProperty('callStack', [undefined, null, 'hoge', 0, {yes: 'no'}, new Error()]);
    });

    it('invalid stackTraceLimit', () => {
      checkInvalidProperty('stackTraceLimit', [undefined, null, 'hoge', true, {yes: 'no'}, new Error()]);
    });
    
    it('invalid breakLength', () => {
      checkInvalidProperty('breakLength', [undefined, null, 'hoge', true, {yes: 'no'}, new Error()]);
    });

    it('invalid colors', () => {
      checkInvalidProperty('colors', [undefined, null, 'hoge', {yes: 'no'}, 0, new Error()]);
    });

    it('invalid compact', () => {
      checkInvalidProperty('compact', [undefined, null, 'hoge', {yes: 'no'}, new Error()]);
    });

    it('invalid depth', () => {
      checkInvalidProperty('depth', [undefined, 'hoge', false, {yes: 'no'}, new Error()]);
    });

    it('invalid maxArrayLength', () => {
      checkInvalidProperty('maxArrayLength', [undefined, 'hoge', false, {yes: 'no'}, new Error()]);
    });

    it('invalid maxStringLength', () => {
      checkInvalidProperty('maxStringLength', [undefined, 'hoge', false, {yes: 'no'}, new Error()]);
    });

    it('invalid sorted', () => {
      checkInvalidProperty('sorted', [undefined, null, 'hoge', {yes: 'no'}, 0, new Error()]);
    });
    
  });

  