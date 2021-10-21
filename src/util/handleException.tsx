import * as Sentry from "@sentry/react";
import type { CaptureContext } from "@sentry/types";
import { toast } from "react-toastify";

export class CapturedError extends Error {
  constructor(
    public readonly name: string,
    public readonly message: string,
    public readonly source: string,
    public readonly originalError: unknown
  ) {
    super(message);
  }
}

const extractErrorMessage = (err: unknown): string => {
  if (!err) {
    return "empty error";
  }
  const errObj = err as Record<string, unknown>;
  const message = errObj.message;
  if (!message) {
    return "empty error message";
  }
  if (typeof message === "string") {
    return message;
  }
  if (typeof message === "object") {
    return message?.toString() ?? "unknown message";
  }
  return "no message could be extracted";
};

export const describeRPCError = (msg: string): string => {
  try {
    const result = JSON.parse(msg.substring("503 : ".length)) as {
      error: {
        code: string;
        message: string;
      };
    };
    return `${result.error.message} (${result.error.code})`;
  } catch (e) {
    // ignore parse error
  }
  return msg;
};

/**
 * Captures an exception.
 */
export const handleException = (
  err: unknown,
  {
    name = err instanceof Error ? err.name : "CapturedError",
    source = name ?? "unspecified",
    userMessage,
    groupInSentry,
  }: {
    /**
     * Custom name to apply to the error.
     */
    name?: string;
    /**
     * Source to apply to the error.
     */
    source?: string;
    /**
     * Notification to send to the user.
     */
    userMessage?: {
      title: string;
      /**
       * Defaults to error's message.
       */
      description?: string;
    };
    /**
     * If true, applies a fingerprint to group the errors by source and name.
     */
    groupInSentry?: boolean;
  } = {
    name: err instanceof Error ? err.name : "CapturedError",
    source: err instanceof Error ? err.name : "unspecified",
  }
): void => {
  const captured = new CapturedError(
    name,
    extractErrorMessage(err),
    source,
    err
  );

  console.error(`[${captured.name}] (from ${captured.source})`);
  console.error(captured);
  console.error(captured.originalError);

  toast(
    <div>
      <span>{userMessage?.title ?? name ?? captured.message}</span>
      <p>{userMessage?.description ?? captured.message}</p>
    </div>
  );

  const sentryArgs: CaptureContext = {
    tags: {
      source,
    },
    extra: {
      originalError: captured.originalError,
      userMessage,
      originalStack:
        captured.originalError instanceof Error
          ? captured.originalError.stack
          : undefined,
    },
  };
  if (groupInSentry) {
    sentryArgs.fingerprint = [captured.name, source];
  }
  Sentry.captureException(captured, sentryArgs);
};
