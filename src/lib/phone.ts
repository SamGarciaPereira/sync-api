import { ValidationError } from "../../infra/errors";

/**
 * Valida um telefone brasileiro (DDD + número, com ou sem +55) e devolve
 * no formato internacional "+5541999998888", pronto para uso no WhatsApp.
 */
export function normalizePhone(value: string): string {
  let digits = value.replace(/\D/g, "");

  if (
    (digits.length === 12 || digits.length === 13) &&
    digits.startsWith("55")
  ) {
    digits = digits.slice(2);
  }

  const validDdd = /^[1-9]{2}/.test(digits);
  const validLength =
    digits.length === 10 || (digits.length === 11 && digits[2] === "9");

  if (!validDdd || !validLength) {
    throw new ValidationError({
      message: "O telefone informado não é válido.",
      action: "Informe DDD e número (ex.: (41) 99999-8888).",
    });
  }

  return `+55${digits}`;
}

/**
 * Converte um telefone (de preferência já normalizado, ex.: "+5541999998888")
 * para o formato que a Evolution API / WhatsApp espera: só dígitos com DDI
 * ("5541999998888").
 */
export function toWhatsAppNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}
