import { Request, Response } from "express";
import { identify } from "../services/identity.service";
import { IdentifyResponse, ErrorResponse } from "../utils/types";

/**
 * POST /identify
 * Identifies a customer and returns consolidated contact information
 */
export const identifyController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, phoneNumber } = req.body;

    // Validate input
    if (!email && !phoneNumber) {
      res.status(400).json({
        error: "At least one of email or phoneNumber must be provided",
      });
      return;
    }

    // Validate email format if provided
    if (email && typeof email !== "string") {
      res.status(400).json({ error: "Email must be a string" });
      return;
    }

    // Validate phoneNumber format if provided
    if (phoneNumber && typeof phoneNumber !== "string") {
      res.status(400).json({ error: "PhoneNumber must be a string" });
      return;
    }

    // Call the service
    const contact = await identify({
      email: email || null,
      phoneNumber: phoneNumber || null,
    });

    // Return success response
    res.status(200).json({
      contact,
    });
  } catch (error) {
    console.error("Error in identifyController:", error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes("must be provided")) {
        res.status(400).json({ error: error.message });
        return;
      }
    }

    // Generic error handling
    res.status(500).json({
      error: "Internal server error",
    });
  }
};
