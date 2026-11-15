import { ServiceError } from "../../infra/errors";

/**
 * Integração com a Evolution API (modo Baileys) para enviar mensagens de
 * WhatsApp a partir do servidor. Usada pelo botão de SOS.
 *
 * Variáveis de ambiente:
 *   - EVOLUTION_API_URL  (ex.: http://localhost:8080)
 *   - EVOLUTION_API_KEY  (a mesma AUTHENTICATION_API_KEY do container)
 *   - EVOLUTION_INSTANCE (nome da instância pareada, ex.: "sync")
 *
 * O envio é "best-effort": a rota decide o que fazer com as falhas. Quando o
 * provedor está indisponível/desconectado, lançamos ServiceError (503) para o
 * front cair no fallback manual (links wa.me).
 */

function config() {
  return {
    url: process.env.EVOLUTION_API_URL,
    apiKey: process.env.EVOLUTION_API_KEY,
    instance: process.env.EVOLUTION_INSTANCE,
  };
}

/** O provedor está configurado (variáveis presentes)? */
export function isConfigured(): boolean {
  const { url, apiKey, instance } = config();
  return Boolean(url && apiKey && instance);
}

function baseHeaders(apiKey: string) {
  return {
    "Content-Type": "application/json",
    apikey: apiKey,
  };
}

/** Estado da conexão da instância ("open", "connecting", "close"...). */
export async function getConnectionState(): Promise<string> {
  const { url, apiKey, instance } = config();
  if (!url || !apiKey || !instance) {
    throw new ServiceError({
      message: "Integração de WhatsApp não configurada.",
      action:
        "Defina EVOLUTION_API_URL, EVOLUTION_API_KEY e EVOLUTION_INSTANCE.",
    });
  }

  let response: Response;
  try {
    response = await fetch(`${url}/instance/connectionState/${instance}`, {
      method: "GET",
      headers: baseHeaders(apiKey),
    });
  } catch (cause) {
    throw new ServiceError({
      cause,
      message: "Não foi possível falar com o serviço de WhatsApp.",
      action: "Verifique se o container da Evolution API está no ar.",
    });
  }

  if (!response.ok) {
    throw new ServiceError({
      message: "Instância de WhatsApp indisponível.",
      action: "Confira se a instância foi criada e está conectada.",
    });
  }

  const data = (await response.json().catch(() => ({}))) as {
    instance?: { state?: string };
    state?: string;
  };
  return data?.instance?.state ?? data?.state ?? "unknown";
}

/**
 * Garante que o provedor está configurado e com a instância conectada ("open").
 * Lança ServiceError (503) caso contrário.
 */
export async function ensureReady(): Promise<void> {
  const state = await getConnectionState();
  if (state !== "open") {
    throw new ServiceError({
      message: "O WhatsApp do SYNC não está conectado no momento.",
      action: "Reconecte a instância (escaneie o QR) e tente novamente.",
    });
  }
}

/**
 * Envia uma mensagem de texto para um número (só dígitos com DDI, ex.:
 * "5541999998888"). Lança em caso de falha.
 */
export async function sendText(number: string, text: string): Promise<void> {
  const { url, apiKey, instance } = config();
  if (!url || !apiKey || !instance) {
    throw new ServiceError({
      message: "Integração de WhatsApp não configurada.",
      action:
        "Defina EVOLUTION_API_URL, EVOLUTION_API_KEY e EVOLUTION_INSTANCE.",
    });
  }

  const response = await fetch(`${url}/message/sendText/${instance}`, {
    method: "POST",
    headers: baseHeaders(apiKey),
    body: JSON.stringify({ number, text }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Evolution sendText falhou (HTTP ${response.status}): ${detail}`,
    );
  }
}

const evolution = {
  isConfigured,
  getConnectionState,
  ensureReady,
  sendText,
};

export default evolution;
