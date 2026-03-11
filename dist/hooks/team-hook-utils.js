import { existsSync } from 'fs';
import { mkdir, readFile, rename, writeFile } from 'fs/promises';
import { join } from 'path';
export function safeString(value, fallback = '') {
    if (typeof value === 'string')
        return value;
    if (value === null || value === undefined)
        return fallback;
    return String(value);
}
export function asNumber(value) {
    if (typeof value === 'number' && Number.isFinite(value))
        return value;
    if (typeof value === 'string') {
        const parsed = Number(value.trim());
        if (Number.isFinite(parsed))
            return parsed;
    }
    return null;
}
export async function readJsonIfExists(path, fallback) {
    try {
        if (!existsSync(path))
            return fallback;
        const raw = await readFile(path, 'utf-8');
        return JSON.parse(raw);
    }
    catch {
        return fallback;
    }
}
export async function writeJsonAtomic(path, value) {
    const dir = join(path, '..');
    await mkdir(dir, { recursive: true }).catch(() => { });
    const tmpPath = `${path}.tmp.${process.pid}.${Date.now()}`;
    await writeFile(tmpPath, JSON.stringify(value, null, 2));
    await rename(tmpPath, path);
}
async function defaultTmuxSendKeys(target, text, literal = false) {
    const { execFile } = await import('child_process');
    const { promisify } = await import('util');
    const execFileAsync = promisify(execFile);
    const args = literal
        ? ['send-keys', '-t', target, '-l', text]
        : ['send-keys', '-t', target, text];
    await execFileAsync('tmux', args, { timeout: 3000 });
}
export const defaultTmux = {
    async sendKeys(target, text, literal = false) {
        await defaultTmuxSendKeys(target, text, literal);
    },
};
//# sourceMappingURL=team-hook-utils.js.map