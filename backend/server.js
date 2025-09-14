// backend/server.js

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dictionary = require('an-array-of-english-words'); // NEW: Import the dictionary

const app = express();
const server = http.createServer(app);

// NEW: Create a Set for fast O(1) word lookups instead of slow array searching
const dictionarySet = new Set(dictionary);

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
  },
});

const games = {};

// --- Constants ---
const ROUND_DURATION = 120;
const VOWELS = 'AEIOU';
const CONSONANTS = 'BCDFGHJKLMNPQRSTVWXYZ';
const COMMON_WORDS = new Set(['the', 'and', 'for', 'you', 'are', 'with', 'was', 'not', 'but', 'from']);

// --- Helper Functions ---
const generateGameCode = () => { /* ... (no changes here) ... */
    let code = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return games[code] ? generateGameCode() : code;
};
const generateLetters = () => { /* ... (no changes here) ... */
    let letters = [];
    for (let i = 0; i < 8; i++) {
        letters.push(VOWELS[Math.floor(Math.random() * VOWELS.length)]);
    }
    for (let i = 0; i < 12; i++) {
        letters.push(CONSONANTS[Math.floor(Math.random() * CONSONANTS.length)]);
    }
    return letters.sort(() => 0.5 - Math.random());
};
const calculateScore = (word) => { /* ... (no changes here) ... */
    if (word.length >= 5) return 20;
    if (word.length === 4) return 15;
    if (word.length === 3) return 10;
    return 0;
};
const canFormWord = (word, letters) => { /* ... (no changes here) ... */
    const letterCounts = {};
    for (const letter of letters) {
        letterCounts[letter] = (letterCounts[letter] || 0) + 1;
    }
    for (const char of word.toUpperCase()) {
        if (!letterCounts[char]) return false;
        letterCounts[char]--;
    }
    return true;
};
const getGameStateForClient = (game) => { /* ... (no changes here) ... */
    if (!game) return null;
    return {
        gameCode: game.gameCode,
        players: game.players,
        status: game.status,
        round: game.round,
        letters: game.letters,
        timer: game.timer,
        roundWinner: game.roundWinner,
        gameWinner: game.gameWinner,
    };
};

// --- Game Logic ---
const startRound = (gameCode) => { /* ... (no changes here) ... */
    const game = games[gameCode];
    if (!game) return;

    if (game.intervalId) clearInterval(game.intervalId);

    game.status = 'playing';
    game.letters = generateLetters();
    game.round++;
    game.timer = ROUND_DURATION;
    game.submittedWords = {};
    game.players.forEach(p => {
        p.submittedWords = [];
        p.roundScore = 0;
        p.ready = false;
        p.wantsToPlayAgain = false; // UPDATED: Reset for new game
    });
    
    io.to(gameCode).emit('gameUpdate', getGameStateForClient(game));

    game.intervalId = setInterval(() => {
        if (game.timer > 0) {
            game.timer--;
            io.to(gameCode).emit('timerTick', game.timer);
        } else {
            endRound(gameCode);
        }
    }, 1000);
};

const endRound = (gameCode) => { /* ... (no changes here) ... */
    const game = games[gameCode];
    if (!game || game.status !== 'playing') return;

    clearInterval(game.intervalId);
    game.intervalId = null;
    game.status = 'round-end';
    
    const roundSubmissions = {};
    game.players.forEach(player => {
        player.submittedWords.forEach(word => {
            if (!roundSubmissions[word]) roundSubmissions[word] = [];
            roundSubmissions[word].push(player.id);
        });
    });

    game.players.forEach(player => {
        player.roundScore = 0;
        player.submittedWords.forEach(word => {
            if (roundSubmissions[word].length === 1) {
                player.roundScore += calculateScore(word);
            }
        });
        player.totalScore += player.roundScore;
    });

    const [p1, p2] = game.players;
    if (p1.roundScore > p2.roundScore) {
        p1.roundsWon++;
        game.roundWinner = p1.name;
    } else if (p2.roundScore > p1.roundScore) {
        p2.roundsWon++;
        game.roundWinner = p2.name;
    } else {
        game.roundWinner = 'Tie';
    }

    if (p1.roundsWon >= 2 || p2.roundsWon >= 2) {
        game.status = 'game-over';
        game.gameWinner = p1.roundsWon > p2.roundsWon ? p1.name : p2.name;
    }

    io.to(gameCode).emit('gameUpdate', getGameStateForClient(game));
};

// --- Player Object ---
const createPlayer = (id, name) => ({
    id,
    name,
    totalScore: 0,
    roundScore: 0,
    roundsWon: 0,
    submittedWords: [],
    ready: false,
    wantsToPlayAgain: false, // NEW: Add property for play again logic
});


// --- Socket Listeners ---
io.on('connection', (socket) => {
    socket.on('createGame', (playerName) => {
        const gameCode = generateGameCode();
        games[gameCode] = {
            gameCode,
            players: [createPlayer(socket.id, playerName)], // UPDATED: Use creator function
            status: 'waiting',
            round: 0,
            letters: [],
            intervalId: null,
        };
        socket.join(gameCode);
        socket.emit('gameCreated', getGameStateForClient(games[gameCode]));
    });

    socket.on('joinGame', ({ gameCode, playerName }) => {
        const game = games[gameCode];
        if (!game) return socket.emit('error', 'Game not found.');
        if (game.players.length >= 2) return socket.emit('error', 'Game is full.');
        
        game.players.push(createPlayer(socket.id, playerName)); // UPDATED: Use creator function
        socket.join(gameCode);
        
        startRound(gameCode);
    });

    socket.on('submitWord', ({ gameCode, word }) => {
        const game = games[gameCode];
        const player = game?.players.find(p => p.id === socket.id);

        if (!game || !player || game.status !== 'playing') return;

        word = word.toLowerCase().trim();

        if (word.length < 3) return socket.emit('invalidWord', 'Word must be at least 3 letters long.');
        if (COMMON_WORDS.has(word)) return socket.emit('invalidWord', 'That is a common word.');
        if (!canFormWord(word, game.letters)) return socket.emit('invalidWord', 'Word contains unavailable letters.');
        if (player.submittedWords.includes(word)) return socket.emit('invalidWord', 'You already submitted that word.');
        
        // NEW: The dictionary check!
        if (!dictionarySet.has(word)) {
            return socket.emit('invalidWord', `'${word.toUpperCase()}' is not a valid word.`);
        }

        player.submittedWords.push(word);
        socket.emit('wordValidated', word);
        io.to(gameCode).emit('gameUpdate', getGameStateForClient(game));
    });

    socket.on('playerReady', (gameCode) => {
        const game = games[gameCode];
        const player = game?.players.find(p => p.id === socket.id);
        if (!game || !player || game.status !== 'round-end') return;

        player.ready = true;
        io.to(gameCode).emit('gameUpdate', getGameStateForClient(game));

        if (game.players.length === 2 && game.players.every(p => p.ready)) {
            startRound(gameCode);
        }
    });
    
    // UPDATED: 'playAgain' logic now requires both players to agree
    socket.on('playAgain', (gameCode) => {
        const game = games[gameCode];
        const player = game?.players.find(p => p.id === socket.id);
        if (!game || !player || game.status !== 'game-over') return;

        player.wantsToPlayAgain = true;
        io.to(gameCode).emit('gameUpdate', getGameStateForClient(game));

        // Check if the other player is also ready
        if (game.players.length === 2 && game.players.every(p => p.wantsToPlayAgain)) {
            // Reset game state for a new match
            game.players.forEach(p => {
                p.totalScore = 0;
                p.roundScore = 0;
                p.roundsWon = 0;
            });
            game.round = 0;
            startRound(gameCode);
        }
    });

    socket.on('disconnect', () => { /* ... (no changes here) ... */
        for (const gameCode in games) {
            const game = games[gameCode];
            const playerIndex = game.players.findIndex(p => p.id === socket.id);
            if (playerIndex !== -1) {
                if (game.intervalId) clearInterval(game.intervalId);
                io.to(gameCode).emit('playerLeft', 'Your opponent has disconnected.');
                delete games[gameCode];
                break;
            }
        }
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));