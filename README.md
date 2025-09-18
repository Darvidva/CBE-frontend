📘 Computer-Based Exam System (Frontend)

This repository contains the **frontend application** for the Computer-Based Exam (CBE) System.  
It is built using **React**, **TypeScript**, and **Vite** to provide a modern, responsive, and fast user interface for students, teachers, and administrators.


✨ Features
- 🎓 **Student Portal**
  - Take multiple-choice exams
  - Automatic result calculation
  - View performance and grades

- 🧑‍🏫 **Admin/Teacher Panel**
  - Manage subjects and questions
  - Monitor student attempts
  - View exam results and analytics

- ⏱️ **Exam Experience**
  - Live countdown timer
  - Auto-submit on timeout
  - Immediate scoring and grading

- 🔐 **Authentication**
  - Role-based access (students/admins)
  - Secure login and session management


📂 Project Structure

Computer-Based Exam System/
├── build/ # Production build output (after build)
├── index.html # Application entry point
├── node_modules/ # Installed dependencies
├── package.json # Project metadata & scripts
├── package-lock.json # Lockfile (auto-generated)
├── README.md # Project documentation
├── src/ # Application source code
│ ├── components/ # Reusable UI components
│ ├── pages/ # Page-level views
│ ├── services/ # API calls & backend integration
│ ├── hooks/ # Custom React hooks
│ ├── context/ # Global state providers
│ └── App.tsx # Main application component
├── vercel.json # Vercel deployment configuration
└── vite.config.ts # Vite build configuration


🛠️ Tech Stack
- **React 18** – UI library
- **TypeScript** – Strong typing
- **Vite** – Lightning-fast dev server & bundler
- **Tailwind CSS** – Styling (if enabled)
- **Axios / Fetch API** – For backend communication
- **Vercel** – Deployment hosting


⚙️ Getting Started

1️⃣ Prerequisites
Make sure you have installed:
- [Node.js](https://nodejs.org/) (v16 or later recommended)
- npm (comes with Node.js)

2️⃣ Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/Darvidva/CBE-frontend.git
cd "Computer-Based Exam System"
npm install
