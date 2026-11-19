/**
 * A Server-Timing header with the time spent in the handler and the region it ran in, shown under Timing in the
 * browser's network panel. Network time to the server is the rest of the request's wait.
 */
export const serverTiming = (startedAt: number) => ({
  "server-timing": `app;dur=${Date.now() - startedAt};desc="${process.env.VERCEL_REGION ?? "local"}"`,
});
