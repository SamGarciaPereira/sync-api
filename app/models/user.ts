import { prisma } from "../../infra/prisma";
import { ValidationError, NotFoundError } from "../../infra/errors";
import bcrypt from "bcryptjs";

export interface UserCreateInput {
  name: string;
  email: string;
  password: string;
}

export interface UserUpdateInput {
  name?: string;
  email?: string;
  password?: string;
  activatedAt?: Date | null;
}

const SALT_ROUNDS = 10;

async function create(userData: UserCreateInput) {
  if (!userData.name || !userData.email || !userData.password) {
    throw new ValidationError({
      message: "Os campos 'name', 'email' e 'password' são obrigatórios.",
      action: "Certifique-se de que preencheu todos os dados necessários.",
    });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email },
  });

  if (existingUser) {
    throw new ValidationError({
      message: "Este e-mail já se encontra registado no sistema.",
      action: "Utilize outro e-mail ou inicie sessão.",
    });
  }

  const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);

  const createdUser = await prisma.user.create({
    data: {
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      activatedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return createdUser;
}

async function findById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      activatedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new NotFoundError({
      message: `Utilizador com o ID '${id}' não foi encontrado.`,
      action: "Verifique se o identificador informado está correto.",
    });
  }

  return user;
}

async function findByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
  });
}

async function listAll() {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      activatedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

async function update(id: string, updateData: UserUpdateInput) {
  await findById(id);

  const dataToUpdate: Record<string, unknown> = { ...updateData };

  if (updateData.password) {
    dataToUpdate.password = await bcrypt.hash(updateData.password, SALT_ROUNDS);
  }

  return await prisma.user.update({
    where: { id },
    data: dataToUpdate,
    select: {
      id: true,
      name: true,
      email: true,
      activatedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

async function activate(id: string) {
  await findById(id);

  return await prisma.user.update({
    where: { id },
    data: {
      activatedAt: new Date(),
    },
    select: {
      id: true,
      name: true,
      email: true,
      activatedAt: true,
    },
  });
}

const user = {
  create,
  findById,
  findByEmail,
  listAll,
  update,
  activate,
};

export default user;
