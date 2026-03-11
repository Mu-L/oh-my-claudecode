import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

vi.mock('child_process', () => ({
  execFile: vi.fn((cmd: string, args: string[], options: { timeout?: number }, callback: (error: null, result: { stdout: string; stderr: string }) => void) => {
    callback(null, { stdout: '', stderr: '' });
  }),
}));

import { asNumber, defaultTmux, readJsonIfExists, safeString, writeJsonAtomic } from '../team-hook-utils.js';

describe('team-hook-utils', () => {
  let tempDir: string | null = null;

  afterEach(() => {
    if (tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
      tempDir = null;
    }
  });

  it('safeString normalizes nullish and non-string values', () => {
    expect(safeString('abc')).toBe('abc');
    expect(safeString(null, 'fallback')).toBe('fallback');
    expect(safeString(undefined, 'fallback')).toBe('fallback');
    expect(safeString(123)).toBe('123');
  });

  it('asNumber parses finite numbers only', () => {
    expect(asNumber(12)).toBe(12);
    expect(asNumber('42')).toBe(42);
    expect(asNumber(' 42 ')).toBe(42);
    expect(asNumber('x')).toBeNull();
    expect(asNumber(Infinity)).toBeNull();
  });

  it('readJsonIfExists returns fallback for missing paths', async () => {
    tempDir = mkdtempSync(join(tmpdir(), 'team-hook-utils-'));
    const missing = await readJsonIfExists(join(tempDir, 'missing.json'), { ok: false });
    expect(missing).toEqual({ ok: false });
  });

  it('writeJsonAtomic writes readable JSON for readJsonIfExists', async () => {
    tempDir = mkdtempSync(join(tmpdir(), 'team-hook-utils-'));
    const file = join(tempDir, 'nested', 'state.json');
    await writeJsonAtomic(file, { ok: true, count: 2 });
    const result = await readJsonIfExists(file, { ok: false, count: 0 });
    expect(result).toEqual({ ok: true, count: 2 });
  });

  it('defaultTmux sends literal keys through tmux', async () => {
    const childProcess = await import('child_process');
    const execFile = vi.mocked(childProcess.execFile);
    await defaultTmux.sendKeys('%1', 'hello', true);
    expect(execFile).toHaveBeenCalledWith(
      'tmux',
      ['send-keys', '-t', '%1', '-l', 'hello'],
      { timeout: 3000 },
      expect.any(Function),
    );
  });
});
