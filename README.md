# Words Collide - Real-Time Multiplayer Word Game

Welcome to Words Collide! This is a real-time multiplayer word game where two players compete to create unique words from a shared set of 20 random letters.

This project is built with the MERN stack (without the M and D) and WebSockets:
- **Frontend**: React.js (`socket.io-client`)
- **Backend**: Node.js with Express (`socket.io`)
- **Deployment**: Configured for Railway.app

## ✨ Features

- **Real-Time Gameplay**: Compete against another player live.
- **Game Lobbies**: Create a private game room with a unique 4-letter code or join an existing one.
- **Synchronized Timers**: A server-authoritative 2-minute timer for each round keeps all players in sync.
- **Dynamic Scoring**: Points are awarded based on word length (3 letters = 10 pts, 4 = 15 pts, 5+ = 20 pts).
- **Word Collision**: If both players submit the same word, neither player gets points for it.
- **Best of 3 Rounds**: The first player to win 2 rounds wins the game.
- **Seamless Flow**: A "Ready" system between rounds and a "Play Again" option keep the game moving.
- **Responsive Design**: Clean, modern interface that works on both desktop and mobile.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd words-collide
```

### 2. Setup the Backend

```bash
cd backend
npm install
```

### 3. Setup the Frontend

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
REACT_APP_BACKEND_URL=http://localhost:3001
```

### 4. Run the Application Locally

1.  **Start the Backend Server**:
    Open a terminal in the `backend` directory and run:
    ```bash
    npm start
    ```
    The server will be running on `http://localhost:3001`.

2.  **Start the Frontend App**:
    Open a second terminal in the `frontend` directory and run:
    ```bash
    npm start
    ```
    The React application will open in your browser at `http://localhost:3000`.

Open two browser windows to simulate two different players.

## 🚂 Deployment on Railway

This project is configured for a seamless monorepo deployment on Railway.

1.  **Create a new Railway Project** and connect it to your GitHub repository.
2.  **Railway will automatically detect the `backend` and `frontend` directories** as two separate services based on the `railway.json` files.
3.  **Configure Environment Variables**:
    * In the **frontend** service settings on Railway, go to the "Variables" tab.
    * Add a new variable: `REACT_APP_BACKEND_URL`.
    * For its value, Railway provides a public URL for your backend service. It will look something like `https://your-backend-service-name.up.railway.app`. Use that URL here.
    * The `PORT` variable is automatically handled by Railway for both services.
4.  **Deploy**: Railway will build and deploy both services. Your game will be live!