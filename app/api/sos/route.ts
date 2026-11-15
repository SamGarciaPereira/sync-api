import { NextRequest, NextResponse } from "next/server";
import controller from "../../../infra/controller";
import { ValidationError } from "../../../infra/errors";
import session from "../../../app/models/session";
import user from "../../../app/models/user";
import emergencyContact from "../../../src/models/emergencyContact";
import sosEvent from "../../../src/models/sosEvent";
import evolution from "../../../src/lib/evolution";
import { toWhatsAppNumber } from "../../../src/lib/phone";

function toCoord(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

// Histórico de acionamentos do SOS do usuário (uso futuro: painel da família).
async function getHandler(req: NextRequest) {
  const userId = await session.getUserId(req);
  const events = await sosEvent.listByUser(userId);
  return NextResponse.json(events, { status: 200 });
}

// Aciona o SOS: envia a mensagem de socorro (WhatsApp) para todos os contatos.
// Corpo opcional: { latitude?, longitude? }
async function postHandler(req: NextRequest) {
  const userId = await session.getUserId(req);
  const body = await req.json().catch(() => ({}));

  const latitude = toCoord(body?.latitude);
  const longitude = toCoord(body?.longitude);

  const contacts = await emergencyContact.list(userId);
  if (contacts.length === 0) {
    throw new ValidationError({
      message: "Você ainda não cadastrou contatos de emergência.",
      action: "Cadastre pelo menos um contato antes de usar o SOS.",
    });
  }

  // Provedor pronto (configurado e conectado)? Se não, 503 → front usa o fallback.
  await evolution.ensureReady();

  const currentUser = await user.findById(userId);
  const message = sosEvent.buildMessage(currentUser.name, {
    latitude,
    longitude,
  });

  const results: { contactId: number; name: string; sent: boolean }[] = [];
  let sentCount = 0;

  for (const contact of contacts) {
    try {
      await evolution.sendText(toWhatsAppNumber(contact.phone), message);
      sentCount++;
      results.push({ contactId: contact.id, name: contact.name, sent: true });
    } catch (error) {
      console.error(`[sos] falha ao enviar para ${contact.phone}:`, error);
      results.push({ contactId: contact.id, name: contact.name, sent: false });
    }
  }

  const event = await sosEvent.record(userId, {
    latitude,
    longitude,
    recipientsCount: contacts.length,
    sentCount,
  });

  return NextResponse.json(
    { event, results, sentCount, message },
    { status: 201 },
  );
}

export const GET = controller.withErrorHandler(getHandler);
export const POST = controller.withErrorHandler(postHandler);

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
