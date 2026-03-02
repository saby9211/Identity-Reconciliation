# Bitespeed Identity Reconciliation Service

A backend web service that identifies and tracks customers across multiple purchases, even when they use different contact information.

## 🔗 Hosted Endpoint

> **Base URL:** `https://your-render-url.onrender.com`
>
> **Endpoint:** `POST /identify`

_(Update the above URL after deploying to Render)_

## 📦 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL (Aiven Cloud)
- **Deployment:** Render.com

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MySQL database (Aiven or local)

### Installation

```bash
git clone https://github.com/saby9211/Identity-Reconciliation.git
cd Identity-Reconciliation
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
DB_HOST=your-aiven-host.aivencloud.com
DB_USER=avnadmin
DB_PASSWORD=your-password
DB_NAME=defaultdb
DB_PORT=12345
```

### Run Locally

```bash
# Development (with hot-reload)
npm run dev

# Production
npm start
```

The Contact table is **auto-created** on server startup.

## 📡 API

### `POST /identify`

**Request Body:**
```json
{
  "email": "mcfly@hillvalley.edu",
  "phoneNumber": "123456"
}
```

At least one of `email` or `phoneNumber` must be provided. `phoneNumber` can be sent as a string or number (auto-coerced to string).

**Response:**
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

### Sample curl

```bash
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email": "mcfly@hillvalley.edu", "phoneNumber": "123456"}'
```

## 🗄️ Database Schema

```sql
CREATE TABLE IF NOT EXISTS Contact (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phoneNumber VARCHAR(20) NULL,
  email VARCHAR(255) NULL,
  linkedId INT NULL,
  linkPrecedence ENUM('primary','secondary') NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deletedAt DATETIME NULL,
  INDEX idx_email (email),
  INDEX idx_phone (phoneNumber),
  INDEX idx_linkedId (linkedId)
);
```

## 🧠 How It Works

1. **Match:** Finds all contacts where `email` OR `phoneNumber` matches the request.
2. **Expand:** Follows `linkedId` references to gather the full contact cluster.
3. **Elect Primary:** The oldest contact (by `createdAt`) becomes the primary.
4. **Merge:** If two separate primaries are linked by the request, the newer one is demoted to secondary.
5. **Create:** If the request contains new information not in the cluster, a new secondary contact is created.
6. **Respond:** Returns the consolidated view with all emails, phone numbers, and secondary IDs.

All operations are wrapped in a **database transaction** for atomicity.

## ✅ Test Cases

Run these **in order** against `POST /identify` on a **fresh database**:

| # | Description | Request Body | Expected Behavior |
|---|-------------|-------------|-------------------|
| 1 | New user (email only) | `{"email":"lorraine@hillvalley.edu"}` | Creates primary |
| 2 | New user (phone only) | `{"phoneNumber":"123456"}` | Creates primary |
| 3 | Match by phone, new email | `{"email":"mcfly@hillvalley.edu","phoneNumber":"123456"}` | Creates secondary linked to #2 |
| 4 | Match by email, new phone | `{"email":"lorraine@hillvalley.edu","phoneNumber":"919191"}` | Creates secondary linked to #1 |
| 5 | Merge two primaries | `{"email":"lorraine@hillvalley.edu","phoneNumber":"123456"}` | #2 demoted to secondary of #1 |
| 6 | Repeated request | `{"email":"lorraine@hillvalley.edu","phoneNumber":"123456"}` | No new row, same response as #5 |
| 7 | Null email, phone only | `{"email":null,"phoneNumber":"123456"}` | Returns full merged cluster |
| 8 | Empty body | `{}` | Returns 400 error |
| 9 | Primary email only | `{"email":"lorraine@hillvalley.edu","phoneNumber":null}` | Returns full merged cluster |
| 10 | Secondary email only | `{"email":"mcfly@hillvalley.edu","phoneNumber":null}` | Returns full merged cluster |
| 11 | phoneNumber as number | `{"email":"biff@hillvalley.edu","phoneNumber":717171}` | Creates primary, phone stored as string |