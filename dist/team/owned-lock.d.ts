export interface OwnedLockOptions {
    timeoutMs: number;
    staleMs: number;
    initialPollMs: number;
    maxPollMs: number;
    jitter?: boolean;
    timeoutErrorMessage: string;
}
export declare function withOwnedLock<T>(lockDir: string, fn: () => Promise<T>, options: OwnedLockOptions): Promise<T>;
//# sourceMappingURL=owned-lock.d.ts.map