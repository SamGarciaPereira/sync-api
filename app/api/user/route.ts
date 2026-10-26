import { NextRequest, NextResponse } from "next/server";
import controller from "../../../infra/controller";
import session from "../../../app/models/session";
import user from "../../../app/models/user";
import { NotFoundError, UnauthorizedError } from "../../../infra/errors";

// Dados do usuário logado (lido do cookie de sessão)
async function getHandler(req: NextRequest) {
  const userId = await session.getUserId(req);

  try {
    const currentUser = await user.findById(userId);
    return NextResponse.json(currentUser, { status: 200 });
  } catch (error) {
    // Sessão de um usuário que não existe mais
    if (error instanceof NotFoundError) {
      throw new UnauthorizedError({
        message: "Sua sessão não é mais válida.",
        action: "Faça login novamente.",
      });
    }
    throw error;
  }
}

export const GET = controller.withErrorHandler(getHandler);

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
