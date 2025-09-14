import React, { useState } from 'react';

function WelcomeScreen({ playerName, setPlayerName, onCreateGame, onJoinGame, waitingMessage }) {
    const [joinCode, setJoinCode] = useState('');

    if (waitingMessage) {
        return (
            <div className="card">
                <div className="card-header">
                    <h1>Words Collide</h1>
                    <p>Real-Time Word Building Game</p>
                </div>
                <div className="card-body">
                     <div className="waiting-message">
                        <h3>{waitingMessage}</h3>
                        <p>Share the code with a friend!</p>
                        <div className="loader"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="card-header">
                <h1>Words Collide</h1>
                <p>Real-Time Word Building Game</p>
            </div>
            <div className="card-body">
                <h2>Welcome to Words Collide!</h2>
                
                <div className="input-group">
                    <label htmlFor="name-input">Your Name</label>
                    <div className="input-with-icon">
                        <i className="fas fa-user"></i>
                        <input
                            id="name-input"
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            placeholder="Enter your name"
                            className="input-field"
                        />
                    </div>
                </div>

                <div className="button-group">
                    <button onClick={onCreateGame} className="btn btn-primary">
                        <i className="fas fa-plus"></i> Create Game
                    </button>
                    <div className="join-game-group">
                         <input
                            type="text"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                            placeholder="Game Code"
                            maxLength="4"
                            className="input-field join-code-input"
                        />
                        <button onClick={() => onJoinGame(joinCode)} className="btn btn-secondary">
                           <i className="fas fa-sign-in-alt"></i> Join Game
                        </button>
                    </div>
                </div>

                <div className="how-to-play">
                    <h3>How to Play</h3>
                    <ul>
                        <li><span className="icon">✔️</span>Create words from shared letters before time runs out.</li>
                        <li><span className="icon">💥</span>If both players create the same word, no one gets points.</li>
                        <li><span className="icon">⭐</span>3-letter words: 10 pts, 4-letter words: 15 pts, 5+ letters: 20 pts.</li>
                        <li><span className="icon">🏆</span>Play 3 rounds - best of 2 wins the game!</li>
                    </ul>
                </div>

                <p className="footer-text">Play with a friend - share the code and start playing!</p>
            </div>
        </div>
    );
}

export default WelcomeScreen;