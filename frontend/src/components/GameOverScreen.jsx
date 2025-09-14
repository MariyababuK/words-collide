// frontend/src/components/GameOverScreen.jsx

import React from 'react';

function GameOverScreen({ gameState, socketId, onPlayAgain }) {
    const me = gameState.players.find(p => p.id === socketId);
    const opponent = gameState.players.find(p => p.id !== socketId);

    const renderPlayAgainButton = () => {
        if (!me) return null;

        if (me.wantsToPlayAgain) {
            return <h4>Waiting for {opponent?.name || 'opponent'} to play again...</h4>;
        }

        return (
            <button onClick={onPlayAgain} className="btn btn-primary">
                Play Again
            </button>
        );
    };

    return (
        <div className="game-over-screen card">
            <h2>Game Over!</h2>
            <h1>🎉 Winner: {gameState.gameWinner} 🎉</h1>
            
            <div className="final-scores">
                {gameState.players.map(p => (
                    <div key={p.id}>
                        <h4>{p.name} {p.id === socketId ? '(You)' : ''}</h4>
                        <p>Final Score: {p.totalScore}</p>
                        <p>Rounds Won: {p.roundsWon}</p>
                    </div>
                ))}
            </div>

            {renderPlayAgainButton()}
        </div>
    );
}

export default GameOverScreen;