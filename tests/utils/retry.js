/**
 * retry.js — tiny, production-friendly retry helper for flaky E2E edges.
 *
 * NOTE: Retries should be used only around known transient failures
 * (timeouts, 5xx, network hiccups). Avoid masking real regressions.
 */

/**
 * @template T
 * @param {() => Promise<T>} fn
 * @param {{
 *   retries?: number;
 *   delayMs?: number;
 *   factor?: number;
 *   maxDelayMs?: number;
 *   shouldRetry?: (error: unknown, attempt: number) => boolean;
 *   onRetry?: (error: unknown, attempt: number, nextDelayMs: number) => void;
 * }} [options]
 */
export async function retryAsync(fn, options = {}) {
  const retries = options.retries ?? 2;
  const delayMs = options.delayMs ?? 300;
  const factor = options.factor ?? 2;
  const maxDelayMs = options.maxDelayMs ?? 2000;
  const shouldRetry = options.shouldRetry ?? (() => true);
  const onRetry = options.onRetry ?? (() => {});

  /** @type {unknown} */
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const canRetry = attempt < retries && shouldRetry(error, attempt + 1);
      if (!canRetry) break;

      const nextDelay = Math.min(
        maxDelayMs,
        Math.round(delayMs * factor ** attempt),
      );
      onRetry(error, attempt + 1, nextDelay);

      // Bounded backoff. This is intentionally short and capped.
      await new Promise((r) => setTimeout(r, nextDelay));
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`retryAsync failed: ${String(lastError)}`);
}
