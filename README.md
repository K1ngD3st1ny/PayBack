# PayBack // Neon

A cyberpunk-themed expense splitting application with a modern, macOS-inspired glassmorphism UI. Manage group expenses, split bills, and settle debts securely.

🔗 **Live Demo:** [https://pay-back-tau.vercel.app/](https://pay-back-tau.vercel.app/)

![PayBack Preview](/frontend/public/window.svg)

## ✨ Features

- **Expense Splitting**: Easily split bills equally or unequally among group members.
- **Debt Simplification**: Automatically visualizes who owes whom with a clear debt matrix.
- **Secure Payments**: Integrated Stripe payments for real-time settlements.
- **Modern UI**: Fully responsive, macOS-inspired interface with glassmorphism, parallax video backgrounds, and smooth animations.
- **Real-time Updates**: Instant state updates for group activities.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express.js, MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Payments**: Stripe Connect

## 🚀 Getting Started Locally

Follow these steps to run the project on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas URL)
- [Stripe Account](https://stripe.com/) (for payment features)

### 1. Clone the Repository

```bash
git clone https://github.com/K1ngD3st1ny/PayBack.git
cd PayBack
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
CLIENT_URL=http://localhost:3000
```

Start the backend server:

```bash
npm run dev
```

The backend should now be running on `http://localhost:5000`.

### 3. Frontend Setup

Open a new terminal, navigate to the frontend directory, and install dependencies:

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

Start the frontend development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## 📁 Project Structure

```
PayBack/
├── backend/            # Express.js API
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   └── controllers/    # Route logic
└── frontend/           # Next.js Application
    ├── src/
    │   ├── app/        # Pages and Layouts
    │   ├── components/ # Reusable UI components
    │   └── lib/        # Utilities and API config
    └── public/         # Static assets
```

---

Made with 💜 by Deepu 
