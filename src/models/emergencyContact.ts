import { prisma } from "../../infra/prisma";
import { ValidationError, NotFoundError } from "../../infra/errors";
import { normalizePhone } from "../lib/phone";

export interface EmergencyContactCreateInput {
  name: string;
  phone: string;
  relationship?: string | null;
  isPrimary?: boolean;
}

export type EmergencyContactUpdateInput = Partial<EmergencyContactCreateInput>;

/** Converte o id da rota ("5") para número, validando. */
function parseId(id: string): number {
  const parsed = Number(id);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ValidationError({
      message: "O id do contato é inválido.",
      action: "Informe um id numérico válido.",
    });
  }
  return parsed;
}

function parseName(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new ValidationError({
      message: "O nome do contato é obrigatório.",
      action: "Informe o nome de quem deve ser avisado.",
    });
  }
  return value.trim();
}

function parseRelationship(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") {
    throw new ValidationError({
      message: "O parentesco informado é inválido.",
      action: "Use um texto curto (ex.: Filha, Vizinho).",
    });
  }
  return value.trim().slice(0, 60);
}

/** Garante que o contato existe e pertence ao usuário logado. */
async function findOwned(id: number, userId: number) {
  const contact = await prisma.emergencyContact.findUnique({ where: { id } });
  if (!contact || contact.userId !== userId) {
    throw new NotFoundError({
      message: `Contato de emergência com o id '${id}' não foi encontrado.`,
      action: "Verifique se o contato pertence a você.",
    });
  }
  return contact;
}

/** Contatos do usuário: o principal primeiro, depois por data de criação. */
async function list(userId: number) {
  return await prisma.emergencyContact.findMany({
    where: { userId },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
  });
}

async function create(userId: number, data: EmergencyContactCreateInput) {
  const name = parseName(data?.name);
  const phone = normalizePhone(String(data?.phone ?? ""));
  const relationship = parseRelationship(data?.relationship);

  // O primeiro contato cadastrado vira o principal automaticamente.
  const count = await prisma.emergencyContact.count({ where: { userId } });
  const isPrimary = count === 0 ? true : Boolean(data?.isPrimary);

  if (isPrimary) {
    // Só um principal por usuário.
    await prisma.emergencyContact.updateMany({
      where: { userId, isPrimary: true },
      data: { isPrimary: false },
    });
  }

  return await prisma.emergencyContact.create({
    data: { userId, name, phone, relationship, isPrimary },
  });
}

async function update(
  id: number,
  userId: number,
  data: EmergencyContactUpdateInput,
) {
  await findOwned(id, userId);

  const dataToUpdate: Record<string, unknown> = {};

  if (data.name !== undefined) dataToUpdate.name = parseName(data.name);
  if (data.phone !== undefined)
    dataToUpdate.phone = normalizePhone(String(data.phone ?? ""));
  if (data.relationship !== undefined)
    dataToUpdate.relationship = parseRelationship(data.relationship);

  if (data.isPrimary === true) {
    await prisma.emergencyContact.updateMany({
      where: { userId, isPrimary: true },
      data: { isPrimary: false },
    });
    dataToUpdate.isPrimary = true;
  } else if (data.isPrimary === false) {
    dataToUpdate.isPrimary = false;
  }

  return await prisma.emergencyContact.update({
    where: { id },
    data: dataToUpdate,
  });
}

async function remove(id: number, userId: number) {
  const contact = await findOwned(id, userId);
  await prisma.emergencyContact.delete({ where: { id } });

  // Se o principal foi removido e ainda há contatos, promove o mais antigo.
  if (contact.isPrimary) {
    const next = await prisma.emergencyContact.findFirst({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
    if (next) {
      await prisma.emergencyContact.update({
        where: { id: next.id },
        data: { isPrimary: true },
      });
    }
  }

  return contact;
}

const emergencyContact = {
  parseId,
  list,
  create,
  update,
  remove,
};

export default emergencyContact;
