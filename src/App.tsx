import React, { useState } from 'react';
import Game from './components/Game';
import Results from './components/Results';
import { GameResult } from './types';
import './App.css';

function App() {
  const [showResults, setShowResults] = useState(false);
  const [gameResults, setGameResults] = useState<GameResult[]>([]);
  const [finalScore, setFinalScore] = useState(0);

  const handleGameEnd = (results: GameResult[], score: number) => {
    setGameResults(results);
    setFinalScore(score);
    setShowResults(true);
  };

  const handlePlayAgain = () => {
    setShowResults(false);
    setGameResults([]);
    setFinalScore(0);
  };

  const handleExitGame = () => {
    setShowResults(false);
    setGameResults([]);
    setFinalScore(0);
  };

  return (
    <div className="App">
      <div className="app-container">
        {showResults ? (
          <Results
            results={gameResults}
            score={finalScore}
            totalQuestions={20}
            onPlayAgain={handlePlayAgain}
          />
        ) : (
          <Game onGameEnd={handleGameEnd} onExitGame={handleExitGame} />
        )}
      </div>
    </div>
  );
}

export default App;
