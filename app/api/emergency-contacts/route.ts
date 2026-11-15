import { NextRequest, NextResponse } from "next/server";
import controller from "../../../infra/controller";
import emergencyContact from "../../../src/models/emergencyContact";
import session from "../../../app/models/session";

// Lista os contatos de emergência do usuário logado.
async function getHandler(req: NextRequest) {
  const userId = await session.getUserId(req);
  const contacts = await emergencyContact.list(userId);
  return NextResponse.json(contacts, { status: 200 });
}

// Cadastra um contato de emergência: { name, phone, relationship?, isPrimary? }
async function postHandler(req: NextRequest) {
  const userId = await session.getUserId(req);
  const body = await req.json();
  const created = await emergencyContact.create(userId, body);
  return NextResponse.json(created, { status: 201 });
}

export const GET = controller.withErrorHandler(getHandler);
export const POST = controller.withErrorHandler(postHandler);

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
