import type { WideEvent } from "@lib/wide-event";
import type { MiddlewareHandler } from "astro";

import { isApiPath } from "@lib/api-paths";
import { log } from "@lib/log";
import { beginRequest, captureError, finish, isDeferred, runWith } from "@lib/wide-event";

function logOnBodyEnd(response: Response, event: WideEvent): Response {
  if (!response.body) {
    log(finish(event, { status_code: response.status }));
    return response;
  }

  const reader = response.body.getReader();
  const emit = () => log(finish(event, { status_code: response.status }));

  const body = new ReadableStream<Uint8Array>({
    async pull(controller) {
      const result = await reader.read();

      if (result.done) {
        emit();
        controller.close();
        return;
      }

      controller.enqueue(result.value);
    },
    async cancel(reason) {
      emit();
      await reader.cancel(reason);
    },
  });

  return new Response(body, response);
}

export const wideEventMiddleware: MiddlewareHandler = async (context, next) => {
  const { pathname } = context.url;
  const api = isApiPath(pathname);
  const event = beginRequest(context.request, { path: pathname, method: context.request.method });

  try {
    const response = await runWith(event, () => next());

    if (isDeferred(event)) return logOnBodyEnd(response, event);

    if (api || response.status >= 400) {
      log(finish(event, { status_code: response.status }));
    }

    return response;
  } catch (error) {
    captureError(error, { phase: "middleware" });
    log(finish(event, { status_code: 500, outcome: "server_error" }));

    throw error;
  }
};
