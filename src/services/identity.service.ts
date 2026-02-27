import { PrismaClient } from "@prisma/client";
import { IdentifyRequest, ConsolidatedContact } from "../utils/types";

const prisma = new PrismaClient();

/**
 * Main identify function
 * Simplified logic without complex recursion
 */
export async function identify(
  request: IdentifyRequest
): Promise<ConsolidatedContact> {
  const { email, phoneNumber } = request;

  // Validation
  if (!email && !phoneNumber) {
    throw new Error("At least one of email or phoneNumber must be provided");
  }

  try {
    // Step 1: Find all existing contacts matching email or phone
    const whereConditions: any[] = [];
    if (email) whereConditions.push({ email });
    if (phoneNumber) whereConditions.push({ phoneNumber });

    const existingContacts = await prisma.contact.findMany({
      where: {
        OR: whereConditions,
        deletedAt: null,
      },
      orderBy: { createdAt: "asc" },
    });

    // Step 2: No existing contacts - create new primary
    if (existingContacts.length === 0) {
      const newContact = await prisma.contact.create({
        data: {
          email: email || null,
          phoneNumber: phoneNumber || null,
          linkPrecedence: "primary",
        },
      });

      return {
        primaryContatctId: newContact.id,
        emails: newContact.email ? [newContact.email] : [],
        phoneNumbers: newContact.phoneNumber ? [newContact.phoneNumber] : [],
        secondaryContactIds: [],
      };
    }

    // Step 3: Find all primary IDs
    const primaryIds = new Set<number>();
    for (const contact of existingContacts) {
      if (contact.linkPrecedence === "primary") {
        primaryIds.add(contact.id);
      } else if (contact.linkedId) {
        primaryIds.add(contact.linkedId);
      }
    }

    // Step 4: Get oldest primary
    const allPrimaries = await prisma.contact.findMany({
      where: {
        id: { in: Array.from(primaryIds) },
        deletedAt: null,
      },
      orderBy: { createdAt: "asc" },
    });

    if (allPrimaries.length === 0) {
      throw new Error("No primary contact found");
    }

    const mainPrimary = allPrimaries[0];

    // Step 5: Merge multiple primaries
    if (allPrimaries.length > 1) {
      for (let i = 1; i < allPrimaries.length; i++) {
        await prisma.contact.update({
          where: { id: allPrimaries[i].id },
          data: {
            linkedId: mainPrimary.id,
            linkPrecedence: "secondary",
          },
        });

        await prisma.contact.updateMany({
          where: {
            linkedId: allPrimaries[i].id,
            deletedAt: null,
          },
          data: { linkedId: mainPrimary.id },
        });
      }
    }

    // Step 6: Get all contacts in group
    const allGroupContacts = await prisma.contact.findMany({
      where: {
        OR: [{ id: mainPrimary.id }, { linkedId: mainPrimary.id }],
        deletedAt: null,
      },
      orderBy: { createdAt: "asc" },
    });

    // Step 7: Check for new information
    const existingEmails = allGroupContacts
      .map((c) => c.email)
      .filter((e) => e !== null);
    const existingPhones = allGroupContacts
      .map((c) => c.phoneNumber)
      .filter((p) => p !== null);

    const hasNewEmail = email && !existingEmails.includes(email);
    const hasNewPhone = phoneNumber && !existingPhones.includes(phoneNumber);

    if (hasNewEmail || hasNewPhone) {
      const newSecondary = await prisma.contact.create({
        data: {
          email: email || null,
          phoneNumber: phoneNumber || null,
          linkedId: mainPrimary.id,
          linkPrecedence: "secondary",
        },
      });
      allGroupContacts.push(newSecondary);
    }

    // Step 8: Build response
    const emails: string[] = [];
    const phoneNumbers: string[] = [];
    const secondaryContactIds: number[] = [];

    // Primary info first
    if (mainPrimary.email) emails.push(mainPrimary.email);
    if (mainPrimary.phoneNumber) phoneNumbers.push(mainPrimary.phoneNumber);

    // Secondary info
    for (const contact of allGroupContacts) {
      if (contact.id !== mainPrimary.id) {
        if(contact.email && !emails.includes(contact.email)) {
          emails.push(contact.email);
        }
        if (contact.phoneNumber && !phoneNumbers.includes(contact.phoneNumber)) {
          phoneNumbers.push(contact.phoneNumber);
        }
        if (contact.linkPrecedence === "secondary") {
          secondaryContactIds.push(contact.id);
        }
      }
    }

    return {
      primaryContatctId: mainPrimary.id,
      emails,
      phoneNumbers,
      secondaryContactIds,
    };
  } catch (error) {
    console.error("Error in identify service:", error);
    throw error;
  }
}
