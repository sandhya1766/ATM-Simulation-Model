# Smart ATM Simulation System

A premium, production-ready full-stack Smart ATM Simulation System designed to emulate modern retail bank terminals (like SBI, HDFC, or ICICI). Built on a secure React & Node.js stack with MongoDB, featuring interactive biometric simulations, thermal paper receipts, AI chatbot support, accessibility guides, and full administrative audit dashboards.

---

## 🌟 Key Features

### 🏦 Customer ATM Simulator
1. **Multi-Factor Login**:
   - **Level 1**: ATM Card validation (Card Number & Expiry MM/YY).
   - **Level 2**: Encrypted PIN authentication (3 attempts lock-out).
   - **Level 3**: 60-Second OTP Verification sent to registered phone/email (simulated in UI with smartphone push alerts).
2. **Financial Operations**:
   - **Cash Withdrawal**: Presets or custom amounts (multiples of ₹100, limits checking, fanned cash drawer animations).
   - **Cash Deposit**: Note counter slot (deposits ₹100 & ₹500 bills, counts denominations, updates ledger instantly).
   - **Fund Transfer**: Transfer funds using Account Number, UPI ID, or Mobile number (protected by transaction-specific OTP verification).
   - **Fast Cash**: Presets (₹500, ₹1000, ₹2000, ₹5000, ₹10000) for instant cash.
3. **Card & Passbook Management**:
   - **Mini Statement**: Last 10 transactions with print and PDF receipts.
   - **Full Statement**: Filter by month, search reference numbers, download as CSV/Excel spreadsheet logs, or print.
   - **Change PIN**: Update ATM PIN securely using current PIN and OTP verification.
   - **Card Lock/Block**: Toggle temporary card freezes or issue permanent block request alerts.
   - **Cheque Book Request**: Submit requests and track shipment statuses.

### 🛡️ Accessibility & Convenience
- **Accessibility Guidance Mode**: Speech synthesis narration (Web Speech API) and large text magnifications.
- **AI Chatbot Agent**: Local responsive chatbot to answer bank queries, transactional limits, and KYC guidelines.
- **Multilingual Toggle**: Supports English, Hindi, and Spanish translations.
- **QR Cash & UPI Withdrawal Simulators**: Generate secure QR codes on screen and approve withdrawals via mock mobile devices.

### 💼 Bank Officer Admin Console
- **Summary Analytics**: Live count widgets of depositors, active cards, frozen accounts, and total vaults value.
- **Customer Directory**: View profile names, linked accounts/cards, and balance states.
- **KYC Approvals Desk**: Review user-submitted files (PAN, Aadhar) and change statuses.
- **Ledger Auditing**: Read complete transaction records.
- **Freeze Controls**: Remotely lock cards or block accounts.

### 👑 Super Admin Auditor Console
- **Manage Admins**: Create or revoke bank executive profile credentials.
- **Security Logs Registry**: Review audit logs showing detailed operator actions, Category classification, IP address tracking, and status outcomes.
- **Database Backup & Recovery**: Instantly export database tables to JSON backups and restore them back via restoration commands.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite), Tailwind CSS, Framer Motion (Page and Cash Dispense animations), React Router, Axios, Lucide/React Icons.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB, Mongoose ODM.
- **Security**: JWT tokens, bcrypt PIN/Password hashing, Helmet headers, CORS policies, Rate limiting, input validation.

---

## 🔑 Quick Sandbox Credentials

Seeded test accounts inside the DB for quick simulation evaluation:

| User Role | Login Method | Card / Email | PIN / Password |
| :--- | :--- | :--- | :--- |
| **Customer** | Card Insertion | `1234 5678 1234 5678` (Exp: `12/28`) | PIN: `1234` |
| **Bank Admin** | Web Password | `admin@banking.com` | `adminpassword` |
| **Super Admin** | Web Password | `super@banking.com` | `superpassword` |

> [!NOTE]
> During customer card login, a mock push notification banner will slide down from the top of the ATM screen showing the generated OTP code for easy copy/autofill!

---

## 🚀 Setting Up the Application

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://localhost:27017/` (or configure your connection string in `backend/.env`)

### Installation & Seeding
1. Install backend packages:
   ```bash
   cd backend
   npm install
   ```
2. Seed the database (Clears old database and populates sandbox profiles):
   ```bash
   npm run seed
   ```
3. Install frontend packages:
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Services
1. Start the Express API server (Runs on port `5000`):
   ```bash
   cd backend
   npm start
   ```
2. Start the Vite React client (Runs on port `5173`):
   ```bash
   cd ../frontend
   npm run dev
   ```
3. Open your browser and navigate to `http://localhost:5173`.
