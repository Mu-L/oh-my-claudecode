import { existsSync } from 'fs';
import { mkdir, readFile, rename, writeFile } from 'fs/promises';
import { join } from 'path';

export function safeString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return fallback;
  return String(value);
}

export function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.trim());
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export async function readJsonIfExists<T>(path: string, fallback: T): Promise<T> {
  try {
    if (!existsSync(path)) return fallback;
    const raw = await readFile(path, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJsonAtomic(path: string, value: unknown): Promise<void> {
  const dir = join(path, '..');
  await mkdir(dir, { recursive: true }).catch(() => {});
  const tmpPath = `${path}.tmp.${process.pid}.${Date.now()}`;
  await writeFile(tmpPath, JSON.stringify(value, null, 2));
  await rename(tmpPath, path);
}

export interface TmuxRunner {
  sendKeys(target: string, text: string, literal?: boolean): Promise<void>;
}

async function defaultTmuxSendKeys(target: string, text: string, literal = false): Promise<void> {
  const { execFile } = await import('child_process');
  const { promisify } = await import('util');
  const execFileAsync = promisify(execFile);
  const args = literal
    ? ['send-keys', '-t', target, '-l', text]
    : ['send-keys', '-t', target, text];
  await execFileAsync('tmux', args, { timeout: 3000 });
}

export const defaultTmux: TmuxRunner = {
  async sendKeys(target: string, text: string, literal = false): Promise<void> {
    await defaultTmuxSendKeys(target, text, literal);
  },
};
