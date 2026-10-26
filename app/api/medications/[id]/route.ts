import { NextRequest, NextResponse } from "next/server";
import controller from "../../../../infra/controller";
import medication from "../../../../src/models/medication";

type RouteParams = { id: string };
type RouteContext = { params: Promise<RouteParams> };

// Detalhe de um medicamento (com horários e item do catálogo)
async function getHandler(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const found = await medication.findById(medication.parseId(id));
  return NextResponse.json(found, { status: 200 });
}

// Edição parcial: envia só os campos que mudaram
async function patchHandler(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const body = await req.json();
  const updatedMedication = await medication.update(
    medication.parseId(id),
    body,
  );
  return NextResponse.json(updatedMedication, { status: 200 });
}

// Remoção lógica: marca como inativo e tira da listagem
async function deleteHandler(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const removedMedication = await medication.remove(medication.parseId(id));
  return NextResponse.json(removedMedication, { status: 200 });
}

export const GET = controller.withErrorHandler<RouteParams>(getHandler);
export const PATCH = controller.withErrorHandler<RouteParams>(patchHandler);
export const DELETE = controller.withErrorHandler<RouteParams>(deleteHandler);

export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}
