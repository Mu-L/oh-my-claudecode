import { mkdir, readFile, rm, stat, writeFile } from 'fs/promises';
import { dirname, join } from 'path';

export interface OwnedLockOptions {
  timeoutMs: number;
  staleMs: number;
  initialPollMs: number;
  maxPollMs: number;
  jitter?: boolean;
  timeoutErrorMessage: string;
}

export async function withOwnedLock<T>(
  lockDir: string,
  fn: () => Promise<T>,
  options: OwnedLockOptions,
): Promise<T> {
  const ownerPath = join(lockDir, 'owner');
  const ownerToken = `${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2)}`;
  const deadline = Date.now() + options.timeoutMs;
  let pollMs = options.initialPollMs;

  await mkdir(dirname(lockDir), { recursive: true });

  while (true) {
    try {
      await mkdir(lockDir, { recursive: false });
      try {
        await writeFile(ownerPath, ownerToken, 'utf8');
      } catch (error) {
        await rm(lockDir, { recursive: true, force: true });
        throw error;
      }
      break;
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code !== 'EEXIST') throw error;

      try {
        const info = await stat(lockDir);
        if (Date.now() - info.mtimeMs > options.staleMs) {
          await rm(lockDir, { recursive: true, force: true });
          continue;
        }
      } catch {
        // best effort
      }

      if (Date.now() > deadline) {
        throw new Error(options.timeoutErrorMessage);
      }

      const sleepMs = options.jitter
        ? Math.floor(pollMs * (0.5 + Math.random() * 0.5))
        : pollMs;
      await new Promise((resolve) => setTimeout(resolve, sleepMs));
      pollMs = Math.min(pollMs * 2, options.maxPollMs);
    }
  }

  try {
    return await fn();
  } finally {
    try {
      const currentOwner = await readFile(ownerPath, 'utf8');
      if (currentOwner.trim() === ownerToken) {
        await rm(lockDir, { recursive: true, force: true });
      }
    } catch {
      // best effort
    }
  }
}
