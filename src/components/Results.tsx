import React from 'react';
import { GameResult } from '../types';
import { calculatePercentage } from '../utils/gameLogic';
import { loadBestScore } from '../utils/storage';
import './Results.css';

interface ResultsProps {
    results: GameResult[];
    score: number;
    totalQuestions: number;
    onPlayAgain: () => void;
}

const Results: React.FC<ResultsProps> = ({
    results,
    score,
    totalQuestions,
    onPlayAgain
}) => {
    const percentage = calculatePercentage(score, totalQuestions);
    const bestScore = loadBestScore();
    const bestPercentage = bestScore ? calculatePercentage(bestScore.score, bestScore.totalQuestions) : 0;

    // Performance message
    const getPerformanceMessage = (percentage: number): string => {
        if (percentage >= 90) return "Perfect! 🎉";
        if (percentage >= 80) return "Great! 👏";
        if (percentage >= 70) return "Good job! 👍";
        if (percentage >= 60) return "Not bad! 😊";
        if (percentage >= 50) return "Average! 🤔";
        return "Keep practicing! 💪";
    };

    // Score color
    const getScoreColor = (percentage: number): string => {
        if (percentage >= 80) return "#2ecc71";
        if (percentage >= 60) return "#f39c12";
        return "#e74c3c";
    };

    return (
        <div className="results-container">
            <div className="results-header">
                <h1>🏆 Game Completed!</h1>
                <div className="score-display">
                    <div className="main-score">
                        <span className="score-number" style={{ color: getScoreColor(percentage) }}>
                            {score}
                        </span>
                        <span className="score-total">/{totalQuestions}</span>
                    </div>
                    <div className="score-percentage" style={{ color: getScoreColor(percentage) }}>
                        %{percentage}
                    </div>
                    <div className="performance-message">
                        {getPerformanceMessage(percentage)}
                    </div>
                </div>
            </div>

            {/* En iyi skor */}
            {bestScore && (
                <div className="best-score">
                    <h3>Your Best Score</h3>
                    <p>
                        {bestScore.score}/{bestScore.totalQuestions} (%{bestPercentage})
                    </p>
                    <p className="best-score-date">
                        {new Date(bestScore.date).toLocaleDateString('en-US')}
                    </p>
                </div>
            )}

            {/* Detaylı sonuçlar */}
            <div className="detailed-results">
                <h3>Detailed Results</h3>
                <div className="results-list">
                    {results.map((result, index) => (
                        <div
                            key={index}
                            className={`result-item ${result.isCorrect ? 'correct' : 'incorrect'}`}
                        >
                            <div className="result-question">
                                <span className="question-number">Question {result.questionNumber}</span>
                                <div className="result-flag">
                                    <img src={result.flag} alt="Flag" />
                                </div>
                            </div>
                            <div className="result-answers">
                                <div className="correct-answer">
                                    <strong>Correct:</strong> {result.correctAnswer}
                                </div>
                                <div className="user-answer">
                                    <strong>Your Answer:</strong> {result.userAnswer}
                                </div>
                            </div>
                            <div className="result-status">
                                {result.isCorrect ? (
                                    <span className="status-correct">✓ Correct</span>
                                ) : (
                                    <span className="status-incorrect">✗ Wrong</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Aksiyon butonları */}
            <div className="action-buttons">
                <button onClick={onPlayAgain} className="play-again-button">
                    Play Again
                </button>
                <button
                    onClick={() => window.location.reload()}
                    className="home-button"
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
};

export default Results;
