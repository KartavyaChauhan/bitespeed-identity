import { PrismaClient } from "@prisma/client";
import { IdentifyRequest, ConsolidatedContact } from "../utils/types";

const prisma = new PrismaClient({
  errorFormat: "pretty",
});

/**
 * Recursively fetches all contacts linked to a given contact ID
 * Returns the entire contact group including the primary and all secondaries
 */
async function getContactGroup(contactId: number): Promise<any[]> {
  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    include: {
      secondaryContacts: true,
      linkedContact: true,
    },
  });

  if (!contact) return [];

  const group: any[] = [contact];

  // If this contact has a linked contact (it's secondary), fetch primary and its group
  if (contact.linkedId) {
    const primary = await getPrimaryContact(contact.linkedId);
    if (primary && primary.id !== contact.id) {
      // Recursively get all contacts from the primary
      const primaryGroup = await getContactGroup(primary.id);
      return primaryGroup;
    }
    return group;
  }

  // If this contact is primary, fetch all secondary contacts recursively
  if (contact.secondaryContacts && contact.secondaryContacts.length > 0) {
    for (const secondary of contact.secondaryContacts) {
      group.push(secondary);
      // Also get any secondaries linked to this secondary
      const nestedSecondaries = await prisma.contact.findMany({
        where: {
          linkedId: secondary.id,
          deletedAt: null,
        },
      });
      group.push(...nestedSecondaries);
    }
  }

  return group;
}

/**
 * Finds the primary contact for a given contact ID
 * Follows the linkedId chain up to the root primary contact
 */
async function getPrimaryContact(contactId: number): Promise<any> {
  let contact = await prisma.contact.findUnique({
    where: { id: contactId },
  });

  if (!contact) return null;

  // Keep going up the chain until we find a contact with no linkedId
  while (contact && contact.linkedId) {
    contact = await prisma.contact.findUnique({
      where: { id: contact.linkedId },
    });
    if (!contact) break;
  }

  return contact;
}

/**
 * Consolidates contact information for a group
 * Ensures primary contact info appears first in arrays
 */
function consolidateContacts(contacts: any[]): ConsolidatedContact {
  // Filter out null/deleted contacts and find the primary
  const validContacts = contacts.filter(
    (c) => c && c.deletedAt === null
  );

  if (validContacts.length === 0) {
    throw new Error("No valid contacts found in group");
  }

  // The primary contact should be the one with linkPrecedence = "primary"
  // and if there are multiple, select the oldest
  const primaryContact = validContacts
    .filter((c) => c.linkPrecedence === "primary")
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )[0];

  if (!primaryContact) {
    throw new Error("No primary contact found in group");
  }

  // Collect emails with primary first
  const emails: string[] = [];
  if (primaryContact.email) emails.push(primaryContact.email);
  
  // Add secondary emails
  for (const contact of validContacts) {
    if (contact.id !== primaryContact.id && contact.email) {
      emails.push(contact.email);
    }
  }

  // Collect phone numbers with primary first
  const phoneNumbers: string[] = [];
  if (primaryContact.phoneNumber) phoneNumbers.push(primaryContact.phoneNumber);
  
  // Add secondary phone numbers
  for (const contact of validContacts) {
    if (contact.id !== primaryContact.id && contact.phoneNumber) {
      phoneNumbers.push(contact.phoneNumber);
    }
  }

  // Get all secondary contact IDs
  const secondaryContactIds = validContacts
    .filter(
      (c) => c.id !== primaryContact.id && c.linkPrecedence === "secondary"
    )
    .map((c) => c.id);

  return {
    primaryContatctId: primaryContact.id,
    emails,
    phoneNumbers,
    secondaryContactIds,
  };
}

/**
 * Main identify function
 * Handles the logic for finding/creating contacts and returning consolidated info
 */
export async function identify(
  request: IdentifyRequest
): Promise<ConsolidatedContact> {
  const { email, phoneNumber } = request;

  // Validation: at least one of email or phoneNumber must be provided
  if (!email && !phoneNumber) {
    throw new Error(
      "At least one of email or phoneNumber must be provided"
    );
  }

  // Step 1: Find all existing contacts matching email or phone
  const whereConditions: any = {
    deletedAt: null,
  };

  const orConditions: any[] = [];
  if (email) {
    orConditions.push({ email });
  }
  if (phoneNumber) {
    orConditions.push({ phoneNumber });
  }

  if (orConditions.length > 0) {
    whereConditions.OR = orConditions;
  }

  const existingContacts = await prisma.contact.findMany({
    where: whereConditions,
  });

  // Step 2: If no existing contacts, create a new primary contact
  if (existingContacts.length === 0) {
    const newContact = await prisma.contact.create({
      data: {
        email: email || null,
        phoneNumber: phoneNumber || null,
        linkPrecedence: "primary",
      },
    });

    return consolidateContacts([newContact]);
  }

  // Step 3: Get all contact groups linked to the matched contacts
  const contactGroups = new Map<number, any[]>();
  const primaryContacts = new Set<any>();

  for (const contact of existingContacts) {
    const primary = await getPrimaryContact(contact.id);
    if (primary) {
      const group = await getContactGroup(primary.id);
      contactGroups.set(primary.id, group);
      primaryContacts.add(primary);
    }
  }

  // Step 4: If we have multiple primary contacts, we need to merge them
  // Keep the oldest as primary, make others secondary
  const sortedPrimaries = Array.from(primaryContacts).sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  if (sortedPrimaries.length === 0) {
    throw new Error("No contacts found in the system");
  }

  const mainPrimary = sortedPrimaries[0];
  const allContactsInGroup = Array.from(contactGroups.values()).flat();

  // Step 5: Check if we need to create a new secondary contact
  // Create new secondary if the incoming request has new information
  const hasNewEmail =
    email && !allContactsInGroup.find((c) => c.email === email);
  const hasNewPhone =
    phoneNumber &&
    !allContactsInGroup.find((c) => c.phoneNumber === phoneNumber);

  if (hasNewEmail || hasNewPhone) {
    // New information detected, create a secondary contact
    await prisma.contact.create({
      data: {
        email: email || null,
        phoneNumber: phoneNumber || null,
        linkedId: mainPrimary.id,
        linkPrecedence: "secondary",
      },
    });
  }

  // Step 6: If there are multiple primary contacts, relink secondary ones
  if (sortedPrimaries.length > 1) {
    for (let i = 1; i < sortedPrimaries.length; i++) {
      const primaryToSecondary = sortedPrimaries[i];
      await prisma.contact.update({
        where: { id: primaryToSecondary.id },
        data: {
          linkedId: mainPrimary.id,
          linkPrecedence: "secondary",
        },
      });

      // Also update all contacts linked to this primary
      const linkedContacts = await prisma.contact.findMany({
        where: {
          linkedId: primaryToSecondary.id,
          deletedAt: null,
        },
      });

      for (const linked of linkedContacts) {
        await prisma.contact.update({
          where: { id: linked.id },
          data: { linkedId: mainPrimary.id },
        });
      }
    }
  }

  // Step 7: Fetch the final consolidated group
  const finalGroup = await getContactGroup(mainPrimary.id);
  return consolidateContacts(finalGroup);
}
