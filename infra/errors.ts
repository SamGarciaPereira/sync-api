export class InternalServerError extends Error {
  statusCode: number;
  action: string;

  constructor({ cause, message }: { cause?: unknown; message?: string } = {}) {
    super(message || "Um erro interno não esperado aconteceu.", { cause });
    this.name = "InternalServerError";
    this.action = "Entre em contato com o suporte.";
    this.statusCode = 500;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class ServiceError extends Error {
  statusCode: number;
  action: string;
  context?: unknown;

  constructor({
    cause,
    message,
    action,
    context,
  }: {
    cause?: unknown;
    message?: string;
    action?: string;
    context?: unknown;
  } = {}) {
    super(message || "Serviço indisponível no momento.", { cause });
    this.name = "ServiceError";
    this.action = action || "Verifique se o serviço está disponível.";
    this.statusCode = 503;
    this.context = context;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
      context: this.context,
    };
  }
}

export class ValidationError extends Error {
  statusCode: number;
  action: string;

  constructor({
    cause,
    message,
    action,
  }: { cause?: unknown; message?: string; action?: string } = {}) {
    super(message || "Um erro de validação ocorreu.", { cause });
    this.name = "ValidationError";
    this.action = action || "Ajuste os dados enviados e tente novamente.";
    this.statusCode = 400;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class NotFoundError extends Error {
  statusCode: number;
  action: string;

  constructor({
    cause,
    message,
    action,
  }: { cause?: unknown; message?: string; action?: string } = {}) {
    super(message || "Não foi possível encontrar este recurso no sistema.", {
      cause,
    });
    this.name = "NotFoundError";
    this.action =
      action || "Verifique se os parâmetros enviados na consulta estão certos.";
    this.statusCode = 404;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class ForbiddenError extends Error {
  statusCode: number;
  action: string;

  constructor({
    cause,
    message,
    action,
  }: { cause?: unknown; message?: string; action?: string } = {}) {
    super(message || "Acesso negado.", { cause });
    this.name = "ForbiddenError";
    this.action =
      action || "Verifique as features necessárias antes de continuar.";
    this.statusCode = 403;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class UnauthorizedError extends Error {
  statusCode: number;
  action: string;

  constructor({
    cause,
    message,
    action,
  }: { cause?: unknown; message?: string; action?: string } = {}) {
    super(message || "Usuário não autenticado.", { cause });
    this.name = "UnauthorizedError";
    this.action = action || "Faça novamente o login para continuar.";
    this.statusCode = 401;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class MethodNotAllowedError extends Error {
  statusCode: number;
  action: string;

  constructor() {
    super("Método não permitido para este endpoint.");
    this.name = "MethodNotAllowedError";
    this.action =
      "Verifique se o método HTTP enviado é válido para este endpoint.";
    this.statusCode = 405;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class TooManyRequestsError extends Error {
  statusCode: number;
  action: string;

  constructor({
    cause,
    message,
    action,
  }: { cause?: unknown; message?: string; action?: string } = {}) {
    super(message || "Muitas tentativas de acesso.", { cause });
    this.name = "TooManyRequestsError";
    this.action = action || "Aguarde alguns minutos e tente novamente.";
    this.statusCode = 429;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}
