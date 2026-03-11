import { afterEach, describe, expect, it } from 'vitest';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { utimes } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { mkdtempSync } from 'fs';

import { withOwnedLock } from '../owned-lock.js';

describe('withOwnedLock', () => {
  let tempDir: string | null = null;

  afterEach(() => {
    if (tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
      tempDir = null;
    }
  });

  it('acquires and releases a lock around work', async () => {
    tempDir = mkdtempSync(join(tmpdir(), 'owned-lock-'));
    const lockDir = join(tempDir, 'dispatch', '.lock');

    const result = await withOwnedLock(lockDir, async () => {
      expect(existsSync(lockDir)).toBe(true);
      return 'ok';
    }, {
      timeoutMs: 1000,
      staleMs: 1000,
      initialPollMs: 10,
      maxPollMs: 10,
      timeoutErrorMessage: 'timeout',
    });

    expect(result).toBe('ok');
    expect(existsSync(lockDir)).toBe(false);
  });

  it('reaps a stale lock before running', async () => {
    tempDir = mkdtempSync(join(tmpdir(), 'owned-lock-'));
    const lockDir = join(tempDir, 'mailbox', '.lock-worker-1');
    mkdirSync(lockDir, { recursive: true });
    writeFileSync(join(lockDir, 'owner'), 'stale-owner', 'utf8');
    const staleDate = new Date(Date.now() - 10_000);
    await utimes(lockDir, staleDate, staleDate);

    const result = await withOwnedLock(lockDir, async () => 'recovered', {
      timeoutMs: 1000,
      staleMs: 100,
      initialPollMs: 10,
      maxPollMs: 10,
      timeoutErrorMessage: 'timeout',
    });

    expect(result).toBe('recovered');
    expect(existsSync(lockDir)).toBe(false);
  });
});
