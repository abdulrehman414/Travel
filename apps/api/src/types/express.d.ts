import 'express';

/** Authenticated principal attached to the request by the auth middleware. */
export interface RequestUser {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
}

declare global {
  namespace Express {
    interface Request {
      id: string;
      user?: RequestUser;
      /** Raw request body bytes, captured for payment webhook signature checks. */
      rawBody?: Buffer;
    }
  }
}

export {};
