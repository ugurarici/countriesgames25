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

    // Performans mesajı
    const getPerformanceMessage = (percentage: number): string => {
        if (percentage >= 90) return "Mükemmel! 🎉";
        if (percentage >= 80) return "Harika! 👏";
        if (percentage >= 70) return "İyi iş! 👍";
        if (percentage >= 60) return "Fena değil! 😊";
        if (percentage >= 50) return "Orta seviye! 🤔";
        return "Daha çok çalışmalısın! 💪";
    };

    // Skor rengi
    const getScoreColor = (percentage: number): string => {
        if (percentage >= 80) return "#2ecc71";
        if (percentage >= 60) return "#f39c12";
        return "#e74c3c";
    };

    return (
        <div className="results-container">
            <div className="results-header">
                <h1>🏆 Oyun Tamamlandı!</h1>
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
                    <h3>En İyi Skorunuz</h3>
                    <p>
                        {bestScore.score}/{bestScore.totalQuestions} (%{bestPercentage})
                    </p>
                    <p className="best-score-date">
                        {new Date(bestScore.date).toLocaleDateString('tr-TR')}
                    </p>
                </div>
            )}

            {/* Detaylı sonuçlar */}
            <div className="detailed-results">
                <h3>Detaylı Sonuçlar</h3>
                <div className="results-list">
                    {results.map((result, index) => (
                        <div
                            key={index}
                            className={`result-item ${result.isCorrect ? 'correct' : 'incorrect'}`}
                        >
                            <div className="result-question">
                                <span className="question-number">Soru {result.questionNumber}</span>
                                <div className="result-flag">
                                    <img src={result.flag} alt="Bayrak" />
                                </div>
                            </div>
                            <div className="result-answers">
                                <div className="correct-answer">
                                    <strong>Doğru:</strong> {result.correctAnswer}
                                </div>
                                <div className="user-answer">
                                    <strong>Senin Cevabın:</strong> {result.userAnswer}
                                </div>
                            </div>
                            <div className="result-status">
                                {result.isCorrect ? (
                                    <span className="status-correct">✓ Doğru</span>
                                ) : (
                                    <span className="status-incorrect">✗ Yanlış</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Aksiyon butonları */}
            <div className="action-buttons">
                <button onClick={onPlayAgain} className="play-again-button">
                    Tekrar Oyna
                </button>
                <button
                    onClick={() => window.location.reload()}
                    className="home-button"
                >
                    Ana Sayfaya Dön
                </button>
            </div>
        </div>
    );
};

export default Results;
