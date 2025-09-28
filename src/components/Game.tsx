import React, { useState } from 'react';
import { GameState, GameResult } from '../types';
import { loadCountries } from '../services/api';
import { createQuestions, createGameResult, calculateScore } from '../utils/gameLogic';
import { saveScore, saveBestScore } from '../utils/storage';
import { useBeforeUnload } from '../hooks/useBeforeUnload';
import './Game.css';

interface GameProps {
    onGameEnd: (results: GameResult[], score: number) => void;
    onExitGame: () => void;
}

const Game: React.FC<GameProps> = ({ onGameEnd, onExitGame }) => {
    const [gameState, setGameState] = useState<GameState>({
        currentQuestion: 0,
        totalQuestions: 20,
        score: 0,
        questions: [],
        results: [],
        isGameStarted: false,
        isGameFinished: false
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

    // Determine if there's an active game that should trigger confirmation dialog
    const isGameActive = gameState.isGameStarted && !gameState.isGameFinished && !loading;

    // Use the beforeunload hook to show confirmation when leaving during active game
    useBeforeUnload(isGameActive, 'You have an active game. Are you sure you want to leave?');

    // Oyunu başlatma
    const startGame = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load country data
            const countriesData = await loadCountries();

            // Create questions
            const questions = createQuestions(countriesData, 20);

            setGameState(prev => ({
                ...prev,
                questions,
                isGameStarted: true,
                currentQuestion: 0,
                score: 0,
                results: []
            }));

        } catch (err) {
            setError('Error loading country data. Please check your internet connection.');
            console.error('Error starting game:', err);
        } finally {
            setLoading(false);
        }
    };

    // Cevap seçme
    const handleAnswerSelect = (answer: string) => {
        if (selectedAnswer) return; // Zaten cevap verilmişse işlem yapma

        setSelectedAnswer(answer);

        const currentQuestion = gameState.questions[gameState.currentQuestion];
        const isCorrect = answer === currentQuestion.correctAnswer;

        // Sonucu kaydet
        const result = createGameResult(
            gameState.currentQuestion + 1,
            currentQuestion,
            answer
        );

        const newResults = [...gameState.results, result];
        const newScore = calculateScore(newResults);

        // Wait 1 second before moving to next question
        setTimeout(() => {
            if (gameState.currentQuestion + 1 >= gameState.totalQuestions) {
                // Oyun bitti
                setGameState(prev => ({
                    ...prev,
                    isGameFinished: true,
                    results: newResults,
                    score: newScore
                }));

                // Skorları kaydet
                saveScore(newScore, gameState.totalQuestions);
                saveBestScore(newScore, gameState.totalQuestions);

                // Oyun sonu callback'ini çağır
                onGameEnd(newResults, newScore);
            } else {
                // Bir sonraki soruya geç
                setGameState(prev => ({
                    ...prev,
                    currentQuestion: prev.currentQuestion + 1,
                    results: newResults,
                    score: newScore
                }));

                setSelectedAnswer(null);
            }
        }, 1000);
    };

    // Oyunu yeniden başlatma
    const restartGame = () => {
        setGameState({
            currentQuestion: 0,
            totalQuestions: 20,
            score: 0,
            questions: [],
            results: [],
            isGameStarted: false,
            isGameFinished: false
        });
        setSelectedAnswer(null);
    };

    // Oyundan çıkma
    const handleExitGame = () => {
        // Aktif oyun varsa onay iste
        if (isGameActive) {
            const confirmed = window.confirm('You have an active game. Are you sure you want to exit?');
            if (!confirmed) {
                return; // Kullanıcı iptal ettiyse çıkma
            }
        }

        restartGame();
        onExitGame();
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading country data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <h2>Error</h2>
                <p>{error}</p>
                <button onClick={startGame} className="retry-button">
                    Try Again
                </button>
            </div>
        );
    }

    if (!gameState.isGameStarted) {
        return (
            <div className="start-screen">
                <h1>🏳️ Flag Game</h1>
                <p>Can you identify 20 different country flags?</p>
                <button onClick={startGame} className="start-button">
                    Start Game
                </button>
            </div>
        );
    }

    if (gameState.isGameFinished) {
        return (
            <div className="game-finished">
                <h2>Game Completed!</h2>
                <p>Your Score: {gameState.score}/{gameState.totalQuestions}</p>
                <button onClick={restartGame} className="play-again-button">
                    Play Again
                </button>
            </div>
        );
    }

    const currentQuestion = gameState.questions[gameState.currentQuestion];
    const progress = ((gameState.currentQuestion + 1) / gameState.totalQuestions) * 100;

    return (
        <div className="game-container">

            {/* Oyundan Çık butonu - sadece oyun başladığında göster */}
            {gameState.isGameStarted && !gameState.isGameFinished && (
                <div className="exit-game-container">
                    <button onClick={handleExitGame} className="exit-game-button">
                        ← Exit Game
                    </button>
                </div>
            )}

            {/* İlerleme çubuğu */}
            <div className="progress-container">
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <span className="progress-text">
                    {gameState.currentQuestion + 1} / {gameState.totalQuestions}
                </span>
            </div>

            {/* Bayrak */}
            <div className="flag-container">
                <img
                    src={currentQuestion.flag}
                    alt="Country flag"
                    className="flag-image"
                    onError={(e) => {
                        // If PNG fails, try SVG as fallback
                        const target = e.target as HTMLImageElement;
                        if (target.src.includes('.png')) {
                            target.src = target.src.replace('.png', '.svg');
                        }
                    }}
                />
            </div>

            {/* Soru */}
            <h2 className="question-text">
                Which country does this flag belong to?
            </h2>

            {/* Seçenekler */}
            <div className="options-container">
                {currentQuestion.options.map((option, index) => {
                    let className = 'option-button';

                    if (selectedAnswer) {
                        if (option === currentQuestion.correctAnswer) {
                            className += ' correct';
                        } else if (option === selectedAnswer && option !== currentQuestion.correctAnswer) {
                            className += ' incorrect';
                        } else {
                            className += ' disabled';
                        }
                    }

                    return (
                        <button
                            key={index}
                            className={className}
                            onClick={() => handleAnswerSelect(option)}
                            disabled={!!selectedAnswer}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>

            {/* Skor */}
            <div className="score-container">
                <span>Score: {gameState.score}</span>
            </div>
        </div>
    );
};

export default Game;
