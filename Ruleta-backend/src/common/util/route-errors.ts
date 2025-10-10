// src/common/util/route-errors.ts - VERSIÓN LIMPIA
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';

export class RouteError extends Error {
  public status: HttpStatusCodes;

  public constructor(status: HttpStatusCodes, message: string) {
    super(message);
    this.status = status;
  }
}

// Eliminar ValidationError (no se usa)