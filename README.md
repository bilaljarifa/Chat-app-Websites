# chatwithme

A modern, real-time MERN stack chat application featuring a beautiful glassmorphic UI, group chats, a robust friend system, and AI-powered sentiment analysis.

## 🌟 Features

### 💬 Real-Time Communication
- Instant messaging powered by **Socket.io**.
- Real-time online/offline user status indicators.
- Live notifications for friend requests and incoming messages.

### 👥 Friends & Groups
- **Robust Friend System**: Send, accept, reject, and cancel friend requests.
- **Group Chats**: Create groups and chat with multiple friends simultaneously.
- **Smart Recommendations**: Get friend recommendations based on shared interests.

### 🎨 Premium UI & Customization
- **Modern Design**: Built with a sleek, glassmorphic aesthetic featuring subtle blur effects and micro-animations.
- **Theme Switching**: Multiple beautiful color themes supported natively via DaisyUI.
- **Profile Customization**: Upload profile avatars (powered by Cloudinary with a local Base64 fallback) and manage personal interests.

### 🤖 Smart Features
- **Sentiment Analysis**: Integrated with HuggingFace inference for real-time sentiment analysis of chat messages.

### 🔒 Security
- Secure authentication using JWT and HttpOnly cookies.
- Protected API routes and encrypted passwords.

## 🛠️ Technology Stack

**Frontend:**
- React 18 (Vite)
- Tailwind CSS & DaisyUI
- Zustand (Global State Management)
- React Router DOM
- Socket.io-client
- Axios
- Lucide React (Icons)

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- Socket.io
- JSON Web Tokens (JWT)
- Cloudinary (Image Hosting)
- HuggingFace Inference API (Sentiment Analysis)

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB connection string
- Cloudinary account (for image uploads)

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/adityaa-guptaa/chat-app.git
cd chat-app
\`\`\`

### 2. Environment Variables
Create a \`.env\` file in the `backend` directory and add the following:
\`\`\`env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development

# Cloudinary Setup
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
\`\`\`

### 3. Install Dependencies

**For Backend:**
\`\`\`bash
cd backend
npm install
\`\`\`

**For Frontend:**
\`\`\`bash
cd frontend
npm install
\`\`\`

### 4. Run the Application

You can start both the frontend and backend servers concurrently. From the root directory (if a concurrent script is setup) or by running them individually:

**Start Backend:**
\`\`\`bash
cd backend
npm run dev
\`\`\`

**Start Frontend:**
\`\`\`bash
cd frontend
npm run dev
\`\`\`

The frontend will start on \`http://localhost:5173\` and the backend on \`http://localhost:5001\`.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! 
