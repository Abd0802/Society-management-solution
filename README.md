# Morya CHS Ltd Transparency Portal

A comprehensive transparency and service management portal for residential societies. Features include document access, RFP tracking, service ticketing, and an AI-powered assistant.

## Features

- **Transparency Dashboard**: High-level overview of society status and statistics.
- **Notice Board**: Centralized announcements and official communications.
- **Document Management**: Secure archive for bye-laws, audit reports, and legal documents.
- **Financial Transparency**: Monthly income and expenditure reports.
- **Service Desk**: Digital ticketing system for member complaints and service requests.
- **RFP/Tender Portal**: Transparent vendor selection process for society projects.
- **AI Assistant**: Smart search and guidance powered by Google Gemini.

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4, Motion (Animations)
- **Backend/Development Server**: Express.js with Vite Middleware
- **Database & Auth**: Firebase (Firestore & Google Authentication)
- **AI Engine**: Google Gemini API

---

## Running Locally

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- A Firebase Project (for Auth and Firestore)
- A Google AI Studio API Key (for the AI assistant)

### Step 1: Clone and Install

```bash
git clone <repository-url>
cd <repository-directory>
npm install
```

### Step 2: Environment Setup

Create a `.env` file in the root directory based on `.env.example`:

```env
# Firebase Configuration (Get these from Firebase Console)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key
```

Also, ensure `firebase-applet-config.json` is correctly populated with your Firebase project details in the root directory. This file is used by the frontend to initialize the Firebase SDK.

Example format for `firebase-applet-config.json`:
```json
{
  "apiKey": "your_api_key",
  "authDomain": "your_project.firebaseapp.com",
  "projectId": "your_project_id",
  "storageBucket": "your_project.firebasestorage.app",
  "messagingSenderId": "your_sender_id",
  "appId": "your_app_id",
  "firestoreDatabaseId": "(default)"
}
```

### Step 3: Run Development Server

```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

---

## Deployment Instructions

### Option 1: Standard Node.js Server (Full-Stack)

This application is configured as a full-stack app with an Express backend serving the Vite frontend.

1. **Build the frontend**:
   ```bash
   npm run build
   ```
2. **Setup environment variables** on your host (Vercel, Render, Railway, Google Cloud Run).
3. **Start the server**:
   ```bash
   npm start
   ```

### Option 2: Static Hosting (Netlify / GitHub Pages)

If you only need the frontend and want to bypass the Express server (handling API logic client-side or via Firebase):

1. **Modify `vite.config.ts`**: Ensure it targets a static build.
2. **Build**: `npm run build`
3. **Deploy contents of `dist/`** to your provider.
   *Note: Client-side routing requires configuring the provider to redirect all requests to `index.html`.*

### Option 3: Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Database Configuration

### Firestore Security Rules
The rules are defined in `firestore.rules`. Deploy them via Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

### Initial Data Setup
Ensure you create a document at `settings/global` in Firestore to initialize society details like name and member counts.

## Contributing

1. Fork the project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## License

Distributed under the MIT License.
