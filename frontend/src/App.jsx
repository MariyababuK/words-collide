import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import WelcomeScreen from './components/WelcomeScreen';
import GameScreen from './components/GameScreen';
import RoundEndScreen from './components/RoundEndScreen';
import GameOverScreen from './components/GameOverScreen';
import './styles/App.css';

// Initialize socket connection
const socket = io(process.env.REACT_APP_BACKEND_URL);

function App() {
    const [gameState, setGameState] = useState(null);
    const [playerName, setPlayerName] = useState('');
    const [notification, setNotification] = useState({ message: '', type: '' });

    const showNotification = (message, type = 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    };

    useEffect(() => {
        socket.on('gameCreated', (game) => setGameState(game));
        socket.on('gameUpdate', (game) => setGameState(game));
        socket.on('timerTick', (time) => {
            setGameState(prev => ({ ...prev, timer: time }));
        });
        socket.on('error', (message) => showNotification(message, 'error'));
        socket.on('invalidWord', (message) => showNotification(message, 'error'));
        socket.on('wordValidated', (word) => showNotification(`'${word.toUpperCase()}' accepted!`, 'success'));
        socket.on('playerLeft', (message) => {
            showNotification(message, 'error');
            setGameState(null); // Reset to welcome screen
        });

        return () => {
            socket.off('gameCreated');
            socket.off('gameUpdate');
            socket.off('timerTick');
            socket.off('error');
            socket.off('invalidWord');
            socket.off('wordValidated');
            socket.off('playerLeft');
        };
    }, []);

    const handleCreateGame = useCallback(() => {
        if (playerName.trim()) {
            socket.emit('createGame', playerName);
        } else {
            showNotification('Please enter your name.');
        }
    }, [playerName]);

    const handleJoinGame = useCallback((gameCode) => {
        if (playerName.trim() && gameCode.trim()) {
            socket.emit('joinGame', { gameCode: gameCode.toUpperCase(), playerName });
        } else {
            showNotification('Please enter your name and a game code.');
        }
    }, [playerName]);

    const handleSubmitWord = useCallback((word) => {
        if (gameState) {
            socket.emit('submitWord', { gameCode: gameState.gameCode, word });
        }
    }, [gameState]);

    const handlePlayerReady = useCallback(() => {
        if (gameState) {
            socket.emit('playerReady', gameState.gameCode);
        }
    }, [gameState]);

    const handlePlayAgain = useCallback(() => {
        if (gameState) {
            socket.emit('playAgain', gameState.gameCode);
        }
    }, [gameState]);

    const renderContent = () => {
        if (!gameState) {
            return (
                <WelcomeScreen
                    playerName={playerName}
                    setPlayerName={setPlayerName}
                    onCreateGame={handleCreateGame}
                    onJoinGame={handleJoinGame}
                />
            );
        }

        switch (gameState.status) {
            case 'playing':
                return <GameScreen gameState={gameState} socketId={socket.id} onSubmitWord={handleSubmitWord} />;
            case 'round-end':
                return <RoundEndScreen gameState={gameState} socketId={socket.id} onPlayerReady={handlePlayerReady} />;
            case 'game-over':
                return <GameOverScreen gameState={gameState} onPlayAgain={handlePlayAgain} />;
            default:
                return <WelcomeScreen
                            playerName={playerName}
                            setPlayerName={setPlayerName}
                            onCreateGame={handleCreateGame}
                            onJoinGame={handleJoinGame}
                            waitingMessage={`Waiting for another player... Code: ${gameState.gameCode}`}
                       />;
        }
    };

    return (
        <div className="app-container">
            <header>
                <h1>Words Collide 💥</h1>
            </header>
            <main>
                {renderContent()}
            </main>
            {notification.message && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}
        </div>
    );
}

export default App;