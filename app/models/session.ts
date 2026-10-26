import { SignJWT, jwtVerify } from "jose";
import type { NextRequest, NextResponse } from "next/server";
import { UnauthorizedError } from "../../infra/errors";

export const SESSION_COOKIE_NAME = "sync_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30; // 30 dias

// Só para desenvolvimento: em produção, SESSION_SECRET é obrigatória.
const DEV_FALLBACK_SECRET = "sync-dev-secret-troque-em-producao";

function getSecretKey() {
  const secret =
    process.env.SESSION_SECRET ||
    (process.env.NODE_ENV === "production" ? "" : DEV_FALLBACK_SECRET);

  if (!secret) {
    throw new Error("SESSION_SECRET não definida");
  }

  return new TextEncoder().encode(secret);
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true, // o JavaScript do navegador não consegue ler o cookie
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

/** Gera o token (JWT assinado) que identifica o usuário logado. */
async function create(userId: number): Promise<string> {
  return await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

function setCookie(response: NextResponse, token: string) {
  response.cookies.set(
    SESSION_COOKIE_NAME,
    token,
    cookieOptions(SESSION_DURATION_SECONDS),
  );
}

function clearCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", cookieOptions(0));
}

/**
 * Lê o cookie da requisição e devolve o id do usuário logado.
 * Lança UnauthorizedError (401) se não houver sessão válida.
 */
async function getUserId(request: NextRequest): Promise<number> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    throw new UnauthorizedError({
      message: "Usuário não autenticado.",
      action: "Faça login para continuar.",
    });
  }

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    const userId = Number(payload.sub);

    if (!Number.isInteger(userId) || userId <= 0) {
      throw new Error("Sessão sem usuário válido");
    }

    return userId;
  } catch {
    throw new UnauthorizedError({
      message: "Sua sessão expirou ou é inválida.",
      action: "Faça login novamente.",
    });
  }
}

const session = {
  create,
  setCookie,
  clearCookie,
  getUserId,
};

export default session;
