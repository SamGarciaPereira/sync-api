import { prisma } from "../../infra/prisma";

const DEFAULT_TZ = process.env.REMINDER_TZ || "America/Sao_Paulo";

export interface SosCoordinates {
  latitude: number | null;
  longitude: number | null;
}

export interface RecordSosInput extends SosCoordinates {
  recipientsCount: number;
  sentCount: number;
}

/** Hora "HH:mm" no fuso configurado, para o rodapé da mensagem. */
function clockLabel(now: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: DEFAULT_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(now);
}

function hasCoordinates(coords: SosCoordinates): boolean {
  return (
    typeof coords.latitude === "number" &&
    Number.isFinite(coords.latitude) &&
    typeof coords.longitude === "number" &&
    Number.isFinite(coords.longitude)
  );
}

/** Monta o texto do pedido de ajuda enviado por WhatsApp. */
function buildMessage(
  userName: string,
  coords: SosCoordinates,
  now: Date = new Date(),
): string {
  const name = userName?.trim() || "Um usuário do SYNC";
  const lines = [
    `🚨 [SYNC] ${name} está pedindo ajuda.`,
    "Por favor, entre em contato ou vá até a pessoa o quanto antes.",
  ];

  if (hasCoordinates(coords)) {
    lines.push(
      `📍 Localização: https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`,
    );
  }

  lines.push(`(enviado às ${clockLabel(now)})`);
  return lines.join("\n");
}

/** Grava o acionamento do SOS (para histórico e acompanhamento). */
async function record(userId: number, data: RecordSosInput) {
  return await prisma.sosEvent.create({
    data: {
      userId,
      latitude: hasCoordinates(data) ? data.latitude : null,
      longitude: hasCoordinates(data) ? data.longitude : null,
      recipientsCount: data.recipientsCount,
      sentCount: data.sentCount,
    },
  });
}

/** Histórico de acionamentos do usuário (uso futuro: painel da família). */
async function listByUser(userId: number) {
  return await prisma.sosEvent.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

const sosEvent = {
  buildMessage,
  record,
  listByUser,
};

export default sosEvent;
