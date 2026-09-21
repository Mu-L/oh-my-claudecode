/**
 * Jev shadow judgment: "context-pruning" (judgment point 5).
 *
 * Shadow-only. The existing heuristic (analyzeContextUsage -> action) still
 * decides everything; Jev's staleness Score is requested asynchronously
 * (blocking: false) and recorded in the shadow log for later comparison.
 * With no key configured this is a no-op: zero HTTP calls, no log.
 */
import { resolveJudgment } from '../jev/index.js';
export const CONTEXT_PRUNING_POINT = 'context-pruning';
/**
 * Score question aligned with the hook's staleness view of context: usage
 * below the warning threshold is fresh, at/above warning is aging, at/above
 * critical is a prune candidate.
 */
const STALENESS_QUESTIONS = {
    staleness: {
        type: 'Score',
        instructions: 'How stale is this context candidate?',
        criteria: {
            fresh: 'Fresh — keep',
            recent: 'Recent',
            aging: 'Aging',
            stale: 'Stale — prune candidate',
        },
    },
};
/**
 * Record one shadow comparison for the context-pruning point.
 *
 * The twin is the heuristic's own action ('none' | 'warn' | 'compact'); the
 * returned promise resolves with that twin immediately (blocking: false) and
 * the Jev comparison is logged when it settles. Never rejects on the Jev
 * path. One call per compaction run with a summary state — never one call
 * per candidate.
 */
export function recordContextPruningShadow(args) {
    return resolveJudgment({
        point: CONTEXT_PRUNING_POINT,
        state: {
            action: args.action,
            totalTokens: args.totalTokens,
            candidateCount: args.candidates.length,
            candidates: args.candidates.map((candidate) => ({
                tool: candidate.tool,
                tokens: candidate.tokens,
                excerpt: candidate.excerpt,
            })),
        },
        questions: STALENESS_QUESTIONS,
        twin: () => args.action,
        blocking: false,
        fetchFn: args.fetchFn,
    });
}
//# sourceMappingURL=jev-shadow.js.map