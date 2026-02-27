/**
 * Type definitions for Bitespeed Identity API
 */

export interface IdentifyRequest {
  email?: string | null;
  phoneNumber?: string | null;
}

export interface ConsolidatedContact {
  primaryContatctId: number;
  emails: string[];
  phoneNumbers: string[];
  secondaryContactIds: number[];
}

export interface IdentifyResponse {
  contact: ConsolidatedContact;
}

export interface ErrorResponse {
  error: string;
}

export interface HealthCheckResponse {
  status: "ok" | "error";
}
