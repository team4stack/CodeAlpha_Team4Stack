export type AuthIdentity =
  | { kind: 'admin'; email: string; role: string }
  | { kind: 'user'; sub: string; email: string };

declare global {
  namespace Express {
    interface Request {
      /** Set by `attachAuth` when Authorization Bearer is valid */
      auth?: AuthIdentity;
    }
  }
}

export {};
