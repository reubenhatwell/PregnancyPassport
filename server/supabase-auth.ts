import { Request, Response, NextFunction } from "express";
import { createRemoteJWKSet, jwtVerify, JWTPayload } from "jose";
import { storage } from "./storage";
import { User as UserType } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends UserType {}
  }
}

const supabaseUrl = process.env.SUPABASE_URL;

if (!supabaseUrl) {
  console.warn("SUPABASE_URL is not set. Supabase auth will fail until configured.");
}

const jwks = supabaseUrl
  ? createRemoteJWKSet(new URL(`${supabaseUrl}/auth/v1/keys`))
  : null;

async function getUserFromTokenPayload(payload: JWTPayload) {
  const supabaseUid = typeof payload.sub === "string" ? payload.sub : undefined;
  if (!supabaseUid) return null;

  // Try to find existing user mapped to this Supabase UID
  const existing = await storage.getUserBySupabaseUid(supabaseUid);
  if (existing) return existing;

  // Auto-provision a user record for this Supabase account
  const email = typeof payload.email === "string" ? payload.email : undefined;
  const userMetadata = (payload as any).user_metadata || {};
  const firstName = userMetadata.firstName || userMetadata.first_name || "User";
  const lastName = userMetadata.lastName || userMetadata.last_name || "Account";

  // Create a synthetic username if not provided in metadata
  const username =
    userMetadata.username ||
    (email ? email.split("@")[0] : `supabase-${supabaseUid.slice(0, 6)}`);

  const role = userMetadata.role === "clinician" ? "clinician" : "patient";

  // Password is unused for Supabase-managed accounts; store a placeholder
  const placeholderPassword = `supabase:${supabaseUid}`;

  return await storage.createUser({
    username,
    email: email || `${supabaseUid}@placeholder.local`,
    password: placeholderPassword,
    firstName,
    lastName,
    role,
    supabaseUid,
  });
}

export async function authenticateSupabase(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!jwks) return res.status(500).send("Supabase not configured");

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : undefined;

  if (!token) return res.sendStatus(401);

  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: `${supabaseUrl}/auth/v1`,
    });

    const user = await getUserFromTokenPayload(payload);
    if (!user) return res.sendStatus(401);

    // Attach user to request and provide an isAuthenticated helper
    (req as any).user = user;
    (req as any).isAuthenticated = () => true;
    return next();
  } catch (error) {
    console.error("Supabase auth error:", error);
    return res.status(401).send("Invalid or expired token");
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!(req as any).user) return res.sendStatus(401);
  next();
}
