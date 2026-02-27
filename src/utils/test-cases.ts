/**
 * Test cases and examples for Bitespeed Identity API
 * 
 * These examples can be used for manual testing with curl or Postman
 */

// Test Case 1: New Customer - Single Email
export const TEST_CASE_1 = {
  description: "New customer with email only",
  request: {
    email: "lorraine@hillvalley.edu",
    phoneNumber: null,
  },
  expectedBehavior:
    "Creates new primary contact, returns empty secondaryContactIds",
};

// Test Case 2: New Customer - Single Phone
export const TEST_CASE_2 = {
  description: "New customer with phone only",
  request: {
    email: null,
    phoneNumber: "123456",
  },
  expectedBehavior:
    "Creates new primary contact, returns empty secondaryContactIds",
};

// Test Case 3: New Customer - Email and Phone
export const TEST_CASE_3 = {
  description: "New customer with both email and phone",
  request: {
    email: "doc@example.com",
    phoneNumber: "9876543210",
  },
  expectedBehavior:
    "Creates new primary contact with both fields, returns empty secondaryContactIds",
};

// Test Case 4: Existing Contact - Exact Match
export const TEST_CASE_4 = {
  description: "Query with exact match to existing primary contact",
  request: {
    email: "lorraine@hillvalley.edu",
    phoneNumber: "123456",
  },
  expectedBehavior: "Returns the existing contact group, no new contact created",
};

// Test Case 5: Existing Contact - Partial Match with New Info
export const TEST_CASE_5 = {
  description: "Same phone, different email (new secondary contact)",
  request: {
    email: "mcfly@hillvalley.edu",
    phoneNumber: "123456",
  },
  expectedBehavior:
    "Creates secondary contact linked to primary, returns consolidated info",
};

// Test Case 6: Multiple Primary Contacts - Merge Operation
export const TEST_CASE_6 = {
  description: "Merge two independent primary contacts",
  request: {
    email: "primary1@example.com",
    phoneNumber: "5555555555",
  },
  expectedBehavior:
    "If primary1@example.com belongs to Contact(1) created first and 5555555555 belongs to Contact(2) created later, links Contact(2) as secondary to Contact(1)",
};

// Test Case 7: Invalid Request - No Email or Phone
export const TEST_CASE_7 = {
  description: "Missing both email and phone",
  request: {
    email: null,
    phoneNumber: null,
  },
  expectedBehavior: "Returns 400 error: At least one field required",
};

/**
 * cURL Commands for manual testing
 *
 * Test 1: New customer
 * curl -X POST http://localhost:3000/identify \
 *   -H "Content-Type: application/json" \
 *   -d '{"email":"lorraine@hillvalley.edu","phoneNumber":"123456"}'
 *
 * Test 2: Same phone, different email
 * curl -X POST http://localhost:3000/identify \
 *   -H "Content-Type: application/json" \
 *   -d '{"email":"mcfly@hillvalley.edu","phoneNumber":"123456"}'
 *
 * Test 3: Health check
 * curl http://localhost:3000/health
 *
 * Test 4: Invalid request
 * curl -X POST http://localhost:3000/identify \
 *   -H "Content-Type: application/json" \
 *   -d '{"email":null,"phoneNumber":null}'
 */

export const CURL_COMMANDS = {
  new_customer: `curl -X POST http://localhost:3000/identify \\
    -H "Content-Type: application/json" \\
    -d '{"email":"lorraine@hillvalley.edu","phoneNumber":"123456"}'`,

  same_phone_new_email: `curl -X POST http://localhost:3000/identify \\
    -H "Content-Type: application/json" \\
    -d '{"email":"mcfly@hillvalley.edu","phoneNumber":"123456"}'`,

  health_check: `curl http://localhost:3000/health`,

  invalid_request: `curl -X POST http://localhost:3000/identify \\
    -H "Content-Type: application/json" \\
    -d '{"email":null,"phoneNumber":null}'`,
};
