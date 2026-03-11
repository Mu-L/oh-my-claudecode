export declare function safeString(value: unknown, fallback?: string): string;
export declare function asNumber(value: unknown): number | null;
export declare function readJsonIfExists<T>(path: string, fallback: T): Promise<T>;
export declare function writeJsonAtomic(path: string, value: unknown): Promise<void>;
export interface TmuxRunner {
    sendKeys(target: string, text: string, literal?: boolean): Promise<void>;
}
export declare const defaultTmux: TmuxRunner;
//# sourceMappingURL=team-hook-utils.d.ts.map