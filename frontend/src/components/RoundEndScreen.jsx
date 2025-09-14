import React from 'react';

function RoundEndScreen({ gameState, socketId, onPlayerReady }) {
    const me = gameState.players.find(p => p.id === socketId);
    const opponent = gameState.players.find(p => p.id !== socketId);
    
    return (
        <div className="round-end-screen card">
            <h2>Round {gameState.round} Over!</h2>
            <h3>Round Winner: {gameState.roundWinner}</h3>
            
            <div className="score-summary">
                <div className="player-score">
                    <h4>{me.name} (You)</h4>
                    <p>Round Score: {me.roundScore}</p>
                    <p>Total Score: {me.totalScore}</p>
                </div>
                 <div className="player-score">
                    <h4>{opponent.name}</h4>
                    <p>Round Score: {opponent.roundScore}</p>
                    <p>Total Score: {opponent.totalScore}</p>
                </div>
            </div>

            {me.ready ? (
                <p>Waiting for {opponent.name}...</p>
            ) : (
                <button onClick={onPlayerReady} className="btn btn-primary">Ready for Next Round</button>
            )}
        </div>
    );
}

export default RoundEndScreen;