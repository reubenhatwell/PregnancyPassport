import { InsertSecurityLog } from "@shared/schema";
import { IStorage } from "./storage";

/**
 * Security audit logger for tracking sensitive operations
 */
export class SecurityLogger {
  private storage: IStorage;

  constructor(storage: IStorage) {
    this.storage = storage;
  }

  /**
   * Log a security event
   * @param userId The ID of the user performing the action (optional for anonymous events)
   * @param action The action being performed (e.g., login, logout, password_change)
   * @param ipAddress The IP address of the user (from request)
   * @param userAgent The user agent of the client (from request)
   * @param details Additional details about the event
   */
  async logSecurityEvent(
    userId: number | null,
    action: string,
    ipAddress: string | null,
    userAgent: string | null,
    details: any = {}
  ): Promise<void> {
    try {
      const securityLog: InsertSecurityLog = {
        userId: userId || null,
        action,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        details: details || {},
      };

      await this.storage.logSecurityEvent(securityLog);
    } catch (error) {
      console.error("Failed to log security event:", error);
      // We don't want to throw an error here, as it would disrupt the main flow
      // Just log the error and continue
    }
  }

  /**
   * Log a successful login attempt
   */
  async logSuccessfulLogin(
    userId: number,
    ipAddress: string | null,
    userAgent: string | null,
    username: string
  ): Promise<void> {
    return this.logSecurityEvent(
      userId,
      "login_success",
      ipAddress,
      userAgent,
      { username }
    );
  }

  /**
   * Log a failed login attempt
   */
  async logFailedLogin(
    ipAddress: string | null,
    userAgent: string | null,
    username: string,
    reason: string
  ): Promise<void> {
    return this.logSecurityEvent(
      null, // User ID is null for failed logins
      "login_failed",
      ipAddress,
      userAgent,
      { username, reason }
    );
  }

  /**
   * Log a logout event
   */
  async logLogout(
    userId: number,
    ipAddress: string | null,
    userAgent: string | null
  ): Promise<void> {
    return this.logSecurityEvent(
      userId,
      "logout",
      ipAddress,
      userAgent
    );
  }

  /**
   * Log a password change
   */
  async logPasswordChange(
    userId: number,
    ipAddress: string | null,
    userAgent: string | null,
    method: "reset" | "change" = "change"
  ): Promise<void> {
    return this.logSecurityEvent(
      userId,
      "password_" + method,
      ipAddress,
      userAgent
    );
  }

  /**
   * Log a sensitive data access
   */
  async logSensitiveDataAccess(
    userId: number,
    ipAddress: string | null,
    userAgent: string | null,
    dataType: string,
    dataId: number
  ): Promise<void> {
    return this.logSecurityEvent(
      userId,
      "sensitive_data_access",
      ipAddress,
      userAgent,
      { dataType, dataId }
    );
  }

  /**
   * Log an account being locked due to too many failed login attempts
   */
  async logAccountLocked(
    userId: number | null,
    ipAddress: string | null,
    userAgent: string | null,
    username: string,
    reason: string = "too_many_failed_attempts"
  ): Promise<void> {
    return this.logSecurityEvent(
      userId,
      "account_locked",
      ipAddress,
      userAgent,
      { username, reason }
    );
  }

  /**
   * Log a permission change
   */
  async logPermissionChange(
    userId: number,
    targetUserId: number,
    ipAddress: string | null,
    userAgent: string | null,
    oldRole: string,
    newRole: string
  ): Promise<void> {
    return this.logSecurityEvent(
      userId,
      "permission_change",
      ipAddress,
      userAgent,
      { targetUserId, oldRole, newRole }
    );
  }

  /**
   * Log a session timeout
   */
  async logSessionTimeout(
    userId: number,
    ipAddress: string | null,
    userAgent: string | null
  ): Promise<void> {
    return this.logSecurityEvent(
      userId,
      "session_timeout",
      ipAddress,
      userAgent
    );
  }

  /**
   * Log a consent change
   */
  async logConsentChange(
    userId: number,
    ipAddress: string | null,
    userAgent: string | null,
    consentType: string,
    consentGiven: boolean
  ): Promise<void> {
    return this.logSecurityEvent(
      userId,
      "consent_change",
      ipAddress,
      userAgent,
      { consentType, consentGiven }
    );
  }
}