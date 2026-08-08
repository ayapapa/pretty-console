	import { describe, expect, it, vi } from 'vitest';
	import { PrettyConsole } from '../src/lib/PrettyConsole.js';

	describe('PrettyConsole', () => {

    const checkDefaultCong = (config) => {
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

    const testConf = {
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
	  	PrettyConsole.setConfig(testConf);
      const conf = PrettyConsole.getConfig();
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
	  	const conf = PrettyConsole.resetConfig();
      checkDefaultCong(PrettyConsole.getConfig());
	  });

/*
    it('current configurations are invariant', () => {
	  	let conf = PrettyConsole.getConfig();
      Object.assign(conf, testConf);
      checkDefaultCong();
	  });
*/
  });

  