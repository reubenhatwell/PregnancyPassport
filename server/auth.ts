import { Express } from "express";

export function setupAuth(app: Express) {
  // With Supabase JWT auth, we only need a user endpoint;
  // authentication is handled via bearer token middleware.
  app.get("/api/user", (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
}
