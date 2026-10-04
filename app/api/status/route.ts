import { NextResponse } from "next/server";
import controller from "../../../infra/controller";

async function getHandler() {
  const response = NextResponse.json(
    {
      status: "API Sync Online",
    },
    { status: 200 },
  );

  return response;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}

export const GET = controller.withErrorHandler(getHandler);
