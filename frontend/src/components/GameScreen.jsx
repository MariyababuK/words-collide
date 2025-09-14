// frontend/src/components/GameScreen.jsx

import React, { useState } from 'react';

function GameScreen({ gameState, socketId, onSubmitWord }) {
    const [currentWord, setCurrentWord] = useState('');

    const me = gameState.players.find(p => p.id === socketId);
    const opponent = gameState.players.find(p => p.id !== socketId);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (currentWord.trim()) {
            onSubmitWord(currentWord);
            setCurrentWord('');
        }
    };
    
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    return (
        // NEW: Wrapped the entire screen in a "card" for a bordered UI
        <div className="card">
            {/* NEW: Using "card-header" for the top section */}
            <div className="card-header game-header">
                <h3>Round {gameState.round}</h3>
                <div className="timer">{formatTime(gameState.timer)}</div>
                <div>Rounds Won: {me?.roundsWon || 0}</div>
            </div>
            
            {/* NEW: Using "card-body" for the main content */}
            <div className="card-body">
                <div className="letters-grid">
                    {gameState.letters.map((letter, index) => (
                        <div key={index} className="letter-tile">{letter}</div>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="word-form">
                    <input
                        type="text"
                        value={currentWord}
                        onChange={(e) => setCurrentWord(e.target.value)}
                        placeholder="Type your word here..."
                        className="input-field"
                        autoFocus
                    />
                    <button type="submit" className="btn btn-primary btn-submit">Submit</button>
                </form>

                <div className="player-info-container">
                    <div className="player-card">
                        <h4>{me?.name || 'You'} (Score: {me?.totalScore || 0})</h4>
                        <ul className="word-list">
                            {me?.submittedWords.map((word, i) => <li key={i}>{word}</li>)}
                        </ul>
                    </div>
                    {opponent && (
                        <div className="player-card">
                            <h4>{opponent.name} (Score: {opponent.totalScore})</h4>
                             <ul className="word-list">
                                {/* Shows opponent's word count, not the words themselves */}
                                {Array(opponent.submittedWords.length).fill().map((_, i) => <li key={i}>***</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default GameScreen;