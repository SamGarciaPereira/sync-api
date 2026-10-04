import { NextRequest, NextResponse } from "next/server";
import {
  InternalServerError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  TooManyRequestsError,
} from "./errors";

type NextRouteContext<TParams = Record<string, string | string[]>> = {
  params: Promise<TParams>;
};

type AppRouteHandler<TParams = Record<string, string | string[]>> = (
  request: NextRequest,
  context: NextRouteContext<TParams>,
) => Promise<NextResponse> | NextResponse;

function handleError(error: unknown): NextResponse {
  if (
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof ForbiddenError ||
    error instanceof TooManyRequestsError
  ) {
    return NextResponse.json(error, { status: error.statusCode });
  }

  if (error instanceof UnauthorizedError) {
    const response = NextResponse.json(error, { status: error.statusCode });
    return response;
  }

  const publicErrorObject = new InternalServerError({
    cause: error instanceof Error ? error : undefined,
  });

  console.error(publicErrorObject);

  return NextResponse.json(publicErrorObject, {
    status: publicErrorObject.statusCode,
  });
}

function withErrorHandler<TParams = Record<string, string | string[]>>(
  handler: AppRouteHandler<TParams>,
) {
  return async function (
    request: NextRequest,
    context: NextRouteContext<TParams>,
  ) {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleError(error);
    }
  };
}

const controller = {
  handleError,
  withErrorHandler,
};

export default controller;
