# TaskFlow — A Smart Task & Project Manager

TaskFlow is a lightweight, responsive Trello/Asana-like Kanban board application built using the MERN stack (MongoDB, Express, React, Node.js) with Tailwind CSS. It features a lightweight AI assistant that analyzes task details (title and description) to suggest optimal effort estimates and due dates.

---

## 🚀 Key Features

- **JWT-Based Authentication**: Secure sign-up/login, password hashing via bcrypt, and session persistence across page refreshes.
- **Kanban Board Workspaces**: Dynamic To Do, In Progress, and Done status columns to group tasks.
- **Task Management**: Full CRUD for tasks including priority status badges, custom due dates, and manual effort tracking.
- **Smart Estimate Assist (AI integration)**: One-click Gemini Flash API analysis that recommends effort levels, suggested due dates, and provides short, descriptive justifications. The integration is safely proxied through the Node.js backend.
- **Dark Mode**: Persisted dark/light visual theme preferences tied to user preferences and local storage.
- **Fully Responsive**: Optimized UI/UX across desktop, tablet, and mobile browsers.

---

## 🏗️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Axios, React Router, React Hot Toast
- **Backend**: Node.js, Express, express-validator, JSON Web Tokens (JWT), bcryptjs
- **Database**: MongoDB Atlas, Mongoose ODM
- **AI Core**: Google Gemini 2.0 Flash API (isolated server-side)

---

## 🔌 REST API Design

### Authentication Routes (`/api/auth`)
* `POST /register` — Register a new account.
* `POST /login` — Log in and receive a JWT.
* `GET /me` — Get current logged-in user profile (requires JWT).
* `PUT /theme` — Update light/dark mode preference (requires JWT).

### Board Routes (`/api/boards`)
* `GET /` — Fetch all boards owned by the authenticated user.
* `POST /` — Create a new Kanban board.
* `GET /:boardId` — Fetch a single board by ID (ownership enforced).
* `PUT /:boardId` — Rename or update a board's description.
* `DELETE /:boardId` — Cascade delete a board and all its tasks.

### Task Routes (`/api/boards/:boardId/tasks`)
* `GET /` — Fetch all tasks for a board (supports filtering by priority/status and sorting).
* `POST /` — Create a task inside a column (auto-calculates drag-and-drop order).
* `GET /:taskId` — Fetch a single task's details.
* `PUT /:taskId` — Update task details, status column, priority, or order.
* `DELETE /:taskId` — Delete a task from the board.

### AI Assist Route (`/api/ai`)
* `POST /suggest` — Query Gemini model for effort and due date estimates.

---

## 🛠️ Installation & Local Setup

### Prerequisites
- Node.js (v18+)
- NPM
- A MongoDB Atlas account or a local MongoDB database

### Backend Setup
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
4. Update the values in `.env` with your MongoDB connection string and Google Gemini API Key:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   GEMINI_API_KEY=your_google_gemini_api_key
   ```
5. Start the backend server:
   * **Development**: `npm run dev`
   * **Production**: `npm start`

### Frontend Setup
1. Navigate to the client folder:
   ```bash
   cd ../client
   ```
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🤖 How the AI Feature Works

1. The frontend task form gathers the `title` and `description` inputted by the user.
2. The user clicks **Suggest Estimate**. The UI sends a POST request to `/api/ai/suggest` with the task parameters.
3. The Express backend receives the request, wraps the inputs in a structured prompt forcing JSON mode, and queries the **Google Gemini 2.0 Flash** API.
4. Gemini returns a structured JSON payload:
   ```json
   {
     "effortEstimate": "M",
     "effortHours": "3-8 hours",
     "suggestedDueDate": "2026-07-03",
     "reasoning": "A login page requires backend routing, front-end forms, and validation..."
   }
   ```
5. The backend validates the response and forwards the suggestions to the frontend.
6. The user is shown the suggestion box. Clicking **Apply** pre-fills the form's due date and effort estimate inputs.

---

## 🧪 Automated Testing

We have built unit and integration tests using **Jest** and **Supertest** to verify backend endpoints. Mongoose queries and auth middlewares are fully mocked to enable rapid validation without external database dependencies.

To run the backend test suite:
```bash
cd server
npm test
```
