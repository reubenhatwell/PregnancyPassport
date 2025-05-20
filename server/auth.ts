import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User, insertUserSchema, InsertSecurityLog } from "@shared/schema";
import { z } from "zod";
import { createFirebaseUser, findFirebaseUserByEmail, updateFirebaseUser } from "./firebase-service";
import { SecurityLogger } from "./security-logger";

declare global {
  namespace Express {
    interface User extends User {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Helper function to extract client info from request
function getClientInfo(req: Request) {
  return {
    ipAddress: req.ip || req.socket.remoteAddress || null,
    userAgent: req.headers["user-agent"] || null
  };
}

export function setupAuth(app: Express) {
  // Initialize security logger
  const securityLogger = new SecurityLogger(storage);
  
  // Default session settings
  const getSessionSettings = (rememberMe = false): session.SessionOptions => ({
    secret: process.env.SESSION_SECRET || "digital-pregnancy-passport-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      // Set longer session timeout if rememberMe is true
      maxAge: rememberMe 
        ? 1000 * 60 * 60 * 24 * 30  // 30 days for "remember me"
        : 1000 * 60 * 60 * 24 * 1,   // 1 day for regular sessions
    },
  });
  
  const sessionSettings = getSessionSettings();

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Extend the schema with custom validation
      const registerSchema = insertUserSchema.extend({
        password: z.string().min(8, "Password must be at least 8 characters"),
        email: z.string().email("Invalid email address"),
        rememberMe: z.boolean().optional().default(false),
      });

      const userData = registerSchema.parse(req.body);
      const rememberMe = userData.rememberMe === true;
      
      // Remove the rememberMe field before creating user
      const { rememberMe: _, ...userDataToSave } = userData;

      // Check if username or email already exists
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).send("Username already exists");
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).send("Email already exists");
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);

      // Create user in our database
      const user = await storage.createUser({
        ...userDataToSave,
        password: hashedPassword,
      });

      // Also create the user in Firebase for authentication and password reset
      try {
        // Create display name from first and last name
        const displayName = `${userData.firstName} ${userData.lastName}`;
        
        // Create a new Firebase user with the same email and password
        await createFirebaseUser(
          userData.email,
          userData.password, // Firebase will hash this automatically
          displayName
        );
        
        console.log(`Firebase user created for ${userData.email}`);
      } catch (firebaseError) {
        // Log Firebase error but don't fail the registration process
        console.error("Error creating Firebase user:", firebaseError);
        // We still continue with our own user creation
      }

      // Set the session cookie expiration based on rememberMe
      if (rememberMe) {
        req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30; // 30 days
      } else {
        req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 1; // 1 day
      }

      // Automatically login the new user
      req.login(user, (err) => {
        if (err) return next(err);
        // Don't send password back to client
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(error.errors);
      }
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    // Handle the remember me flag
    const rememberMe = req.body.rememberMe === true;
    
    // Set the session cookie expiration based on the rememberMe flag
    if (rememberMe) {
      req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30; // 30 days
    } else {
      req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 1; // 1 day
    }
    
    passport.authenticate("local", async (err, user, info) => {
      if (err) return next(err);
      
      const { ipAddress, userAgent } = getClientInfo(req);
      
      if (!user) {
        // Log failed login attempt
        await securityLogger.logFailedLogin(
          ipAddress,
          userAgent,
          req.body.username,
          "Invalid credentials"
        );
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      req.login(user, async (loginErr) => {
        if (loginErr) return next(loginErr);
        
        // Log successful login
        await securityLogger.logSuccessfulLogin(
          user.id,
          ipAddress,
          userAgent,
          user.username
        );
        
        // Don't send password back to client
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", async (req, res, next) => {
    // Only log logout if user is actually authenticated
    if (req.isAuthenticated()) {
      const { ipAddress, userAgent } = getClientInfo(req);
      const userId = req.user.id;
      
      // Log logout before actually logging out
      await securityLogger.logLogout(userId, ipAddress, userAgent);
    }
    
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    // Don't send password back to client
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });

  // Endpoint to check if an email exists in the system
  // Used by the password reset feature
  app.post("/api/check-email", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Check if the email exists in our database
      const user = await storage.getUserByEmail(email);
      
      // Also check if the user exists in Firebase
      const firebaseUser = await findFirebaseUserByEmail(email);
      
      // We don't tell the client whether the email exists for security reasons
      // Just return success (this is a security best practice)
      res.status(200).json({ 
        message: "If this email is registered, a password reset link will be sent"
      });
    } catch (error) {
      console.error("Error checking email:", error);
      res.status(500).json({ message: "An error occurred while checking email" });
    }
  });
  
  // Password reset endpoint - used after a user clicks the reset link in their email
  app.post("/api/reset-password", async (req, res) => {
    try {
      const { email, newPassword, oobCode } = req.body;
      
      if (!email || !newPassword) {
        return res.status(400).json({ message: "Email and new password are required" });
      }
      
      // Check if user exists in our database
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Don't reveal that the email doesn't exist
        return res.status(400).json({ message: "Invalid or expired password reset link" });
      }
      
      // 1. Update password in our database
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUserPassword(user.id, hashedPassword);
      
      // 2. Update password in Firebase
      try {
        const firebaseUser = await findFirebaseUserByEmail(email);
        if (firebaseUser) {
          await updateFirebaseUser(firebaseUser.uid, { password: newPassword });
        }
      } catch (firebaseError) {
        console.error("Error updating Firebase password:", firebaseError);
        // Continue anyway as our main database is updated
      }
      
      // 3. Log the password reset for security audit
      const { ipAddress, userAgent } = getClientInfo(req);
      await securityLogger.logPasswordChange(
        user.id,
        ipAddress,
        userAgent,
        "reset" // Password was reset, not changed directly
      );
      
      res.status(200).json({ message: "Password has been reset successfully. You can now log in with your new password." });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "An error occurred while resetting your password" });
    }
  });
}
