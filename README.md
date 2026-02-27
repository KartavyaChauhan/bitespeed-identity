# Bitespeed Identity Reconciliation Backend

A robust TypeScript backend service that identifies and consolidates customer identities across multiple purchases using email and phone number matching.

## 📋 About

This service solves the problem of tracking customer identities when they use different contact information across multiple purchases. It maintains customer relationships and provides a unified view of all contact details associated with a person.

**Stack**: Node.js + Express + TypeScript + PostgreSQL + Prisma ORM

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd bitespeed-identity
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Set up database**
   ```bash
   npx prisma migrate dev
   ```

5. **Build TypeScript**
   ```bash
   npm run build
   ```

6. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm run start
   ```

The server will start on `http://localhost:3000`

## 📚 API Documentation

### Health Check
- **Endpoint**: `GET /health`
- **Response**: `{ "status": "ok" }`

### Identity Identification
- **Endpoint**: `POST /identify`
- **Content-Type**: `application/json`

#### Request Body
```json
{
  "email": "user@example.com",
  "phoneNumber": "1234567890"
}
```

**Note**: At least one of `email` or `phoneNumber` is required.

#### Response (HTTP 200)
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": [23]
  }
}
```

#### Error Response (HTTP 400/500)
```json
{
  "error": "Error message describing what went wrong"
}
```

## 🔄 Contact Reconciliation Logic

### How It Works

1. **New Contact**: If no existing contacts match the email/phone, create a new primary contact
2. **Existing Match**: If contacts exist with matching email or phone:
   - If new information is provided → create a secondary contact linked to primary
   - If only existing info → return consolidated view
3. **Multiple Primaries**: If multiple independent contact groups exist with matching info, link them all to the oldest primary

### Example Scenarios

#### Scenario 1: New Customer
```
Request:
{
  "email": "john@example.com",
  "phoneNumber": "9876543210"
}

Result: Creates new primary contact
```

#### Scenario 2: Existing Customer, Same Info
```
Existing: Contact(1) with email: john@example.com, phone: 9876543210

Request:
{
  "email": "john@example.com",
  "phoneNumber": "9876543210"
}

Result: Returns existing contact info, no new contact created
```

#### Scenario 3: Existing Customer, New Email
```
Existing: Contact(1) primary with email: john@example.com, phone: 9876543210

Request:
{
  "email": "newemail@example.com",
  "phoneNumber": "9876543210"
}

Result: Creates Contact(2) as secondary linked to Contact(1)
```

#### Scenario 4: Merging Contact Groups
```
Existing:
- Contact(1) primary: john@example.com, 9876543210
- Contact(2) primary: jane@example.com, 5555555555

Request:
{
  "email": "john@example.com",
  "phoneNumber": "5555555555"
}

Result: Links Contact(2) as secondary to Contact(1) (oldest primary)
```

## 🛠️ Development

### Available Commands

```bash
npm run dev          # Start development server with live reload
npm run build        # Build TypeScript
npm run start        # Run production build
npm test             # Run tests (when added)
```

### Project Structure

```
src/
├── controllers/      # Route handlers
├── routes/          # Route definitions
├── services/        # Business logic
├── utils/           # Utility functions
└── index.ts         # Application entry point

prisma/
└── schema.prisma    # Database schema
```

## 📊 Database Schema

### Contact Model

```prisma
model Contact {
  id             Int       @id @default(autoincrement())
  phoneNumber    String?
  email          String?
  linkedId       Int?      // Link to primary contact
  linkPrecedence String    // "primary" or "secondary"
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  deletedAt      DateTime? // Soft delete support
}
```

**Indexes**:
- email (for fast lookup)
- phoneNumber (for fast lookup)

## 🌐 Deployment

### Deploy to Render.com

1. **Create Render Account**: https://render.com

2. **Create PostgreSQL Database**:
   - Go to Dashboard → New → PostgreSQL
   - Note the internal database URL

3. **Create Web Service**:
   - New → Web Service
   - Connect GitHub repository
   - Build Command: `npm install && npm run build && npx prisma migrate deploy`
   - Start Command: `npm run start`
   - Add environment variable: `DATABASE_URL` = (from PostgreSQL)

4. **Quick Deploy Summary**
   ```
   Build Command:   npm install && npm run build && npx prisma migrate deploy
   Start Command:   npm run start
   Environment:     DATABASE_URL=<your-postgres-url>
   ```

### Environment Setup

Create the following environment variables:

```
# .env file
DATABASE_URL=postgresql://user:password@localhost:5432/bitespeed_db?schema=public
PORT=3000
NODE_ENV=development
```

## 🧪 Manual Testing

Using curl:

```bash
# New contact
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","phoneNumber":"1234567890"}'

# Query existing contact
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com"}'

# Health check
curl http://localhost:3000/health
```

Using Postman:
1. Create new POST request
2. URL: `http://localhost:3000/identify`
3. Body (JSON):
   ```json
   {
     "email": "john@example.com",
     "phoneNumber": "1234567890"
   }
   ```
4. Send

## 🔒 Security Considerations

- Input validation on email and phone number
- SQL injection prevention through Prisma ORM
- Soft delete support (deletedAt field) for data retention
- No sensitive data in logs
- CORS can be configured if needed

## 📝 Code Quality

- **Type Safety**: Full TypeScript with strict mode enabled
- **Error Handling**: Comprehensive error handling with meaningful messages
- **Code Structure**: Clean separation of concerns (controllers, services)
- **Scalability**: Database indexes on frequently queried columns

## 🐛 Troubleshooting

### Database Connection Failed
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Ensure database exists

### Port Already in Use
- Change `PORT` in `.env` or run:
  ```bash
  PORT=3001 npm run dev
  ```

### Prisma Client Not Generated
- Run: `npx prisma generate`

## 📄 License

ISC

## 👨‍💻 Author

Built with care for Bitespeed

---

**Deployed at**: https://bitespeed-identity-110j.onrender.com

**GitHub Repository**: https://github.com/KartavyaChauhan/bitespeed-identity
