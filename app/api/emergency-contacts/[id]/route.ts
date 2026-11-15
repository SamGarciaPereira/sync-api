import { NextRequest, NextResponse } from "next/server";
import controller from "../../../../infra/controller";
import emergencyContact from "../../../../src/models/emergencyContact";
import session from "../../../../app/models/session";

type RouteParams = { id: string };
type RouteContext = { params: Promise<RouteParams> };

// Edição parcial do contato: envia só os campos que mudaram.
async function patchHandler(req: NextRequest, { params }: RouteContext) {
  const userId = await session.getUserId(req);
  const { id } = await params;
  const body = await req.json();
  const updated = await emergencyContact.update(
    emergencyContact.parseId(id),
    userId,
    body,
  );
  return NextResponse.json(updated, { status: 200 });
}

// Remove o contato de emergência.
async function deleteHandler(req: NextRequest, { params }: RouteContext) {
  const userId = await session.getUserId(req);
  const { id } = await params;
  const removed = await emergencyContact.remove(
    emergencyContact.parseId(id),
    userId,
  );
  return NextResponse.json(removed, { status: 200 });
}

export const PATCH = controller.withErrorHandler<RouteParams>(patchHandler);
export const DELETE = controller.withErrorHandler<RouteParams>(deleteHandler);

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
