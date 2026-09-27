import { sseListeners } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const encoder = new TextEncoder();

  let cleanup: (() => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const listener = (data: { event: string; payload: any }) => {
        try {
          const message = `event: ${data.event}\ndata: ${JSON.stringify(data.payload)}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (e) {
          console.warn("SSE controller write error", e);
        }
      };

      sseListeners.add(listener);

      // Keep-alive heartbeat ping every 15 seconds
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch (e) {
          clearInterval(interval);
        }
      }, 15000);

      cleanup = () => {
        clearInterval(interval);
        sseListeners.delete(listener);
      };
    },
    cancel() {
      if (cleanup) cleanup();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
