import { NextRequest, NextResponse } from "next/server";
import controller from "../../../infra/controller";
import medication from "../../../src/models/medication";

async function getHandler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isCatalogSearch = searchParams.get("catalog") === "true";
  const query = searchParams.get("q") || "";
  const userIdParam = searchParams.get("userId");

  // Fluxo 1: Autocomplete inteligente ao digitar o nome do remédio
  if (isCatalogSearch) {
    await medication.ensureCatalogSeeded();
    const suggestions = await medication.searchCatalog(query);
    return NextResponse.json(suggestions, { status: 200 });
  }

  // Fluxo 2: Listagem de medicamentos cadastrados para o usuário (userId obrigatório)
  const userId = medication.parseId(userIdParam, "userId");
  const includeInactive = searchParams.get("includeInactive") === "true";
  const medications = await medication.listAll(userId, includeInactive);
  return NextResponse.json(medications, { status: 200 });
}

async function postHandler(req: NextRequest) {
  const body = await req.json();
  const createdMedication = await medication.create(body);
  return NextResponse.json(createdMedication, { status: 201 });
}

export const GET = controller.withErrorHandler(getHandler);
export const POST = controller.withErrorHandler(postHandler);

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
