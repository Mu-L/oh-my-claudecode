import { describe, expect, it } from 'vitest';
import {
  shouldLoadShellRc,
  validateCliBinaryPath,
  resolveCliBinaryPath,
  clearResolvedPathCache,
} from '../index.js';

describe('team index backward-compat exports', () => {
  it('re-exports legacy CLI path helpers', () => {
    expect(typeof shouldLoadShellRc).toBe('function');
    expect(typeof validateCliBinaryPath).toBe('function');
    expect(typeof resolveCliBinaryPath).toBe('function');
    expect(typeof clearResolvedPathCache).toBe('function');
  });
});
