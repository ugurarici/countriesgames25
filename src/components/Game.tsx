import React, { useState } from 'react';
import { GameState, GameResult } from '../types';
import { loadCountries } from '../services/api';
import { createQuestions, createGameResult, calculateScore } from '../utils/gameLogic';
import { saveScore, saveBestScore } from '../utils/storage';
import { useBeforeUnload } from '../hooks/useBeforeUnload';
import Confetti from 'react-confetti';
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
    const [showConfetti, setShowConfetti] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

    // Determine if there's an active game that should trigger confirmation dialog
    const isGameActive = gameState.isGameStarted && !gameState.isGameFinished && !loading;

    // Use the beforeunload hook to show confirmation when leaving during active game
    useBeforeUnload(isGameActive, 'Aktif oyununuz var. Sayfadan ayrılmak istediğinizden emin misiniz?');

    // Oyunu başlatma
    const startGame = async () => {
        try {
            setLoading(true);
            setError(null);

            // Ülke verilerini yükle
            const countriesData = await loadCountries();

            // Soruları oluştur
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
            setError('Ülke verileri yüklenirken hata oluştu. Lütfen internet bağlantınızı kontrol edin.');
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

        // Doğru cevap ise konfeti göster
        if (isCorrect) {
            setShowConfetti(true);
            // Konfeti'yi 2 saniye sonra fadeout ile kaybolacak şekilde ayarla
            setTimeout(() => {
                setShowConfetti(false);
            }, 2000);
        }

        // 1.5 saniye sonra bir sonraki soruya geç (konfeti için zaman tanı)
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
        }, 1500);
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
        setShowConfetti(false);
    };

    // Oyundan çıkma
    const handleExitGame = () => {
        // Aktif oyun varsa onay iste
        if (isGameActive) {
            const confirmed = window.confirm('Aktif oyununuz var. Oyundan çıkmak istediğinizden emin misiniz?');
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
                <p>Ülke verileri yükleniyor...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <h2>Hata</h2>
                <p>{error}</p>
                <button onClick={startGame} className="retry-button">
                    Tekrar Dene
                </button>
            </div>
        );
    }

    if (!gameState.isGameStarted) {
        return (
            <div className="start-screen">
                <h1>🏳️ Bayrak Oyunu</h1>
                <p>20 farklı ülke bayrağını tanıyabilir misin?</p>
                <button onClick={startGame} className="start-button">
                    Oyunu Başlat
                </button>
            </div>
        );
    }

    if (gameState.isGameFinished) {
        return (
            <div className="game-finished">
                <h2>Oyun Tamamlandı!</h2>
                <p>Skorunuz: {gameState.score}/{gameState.totalQuestions}</p>
                <button onClick={restartGame} className="play-again-button">
                    Tekrar Oyna
                </button>
            </div>
        );
    }

    const currentQuestion = gameState.questions[gameState.currentQuestion];
    const progress = ((gameState.currentQuestion + 1) / gameState.totalQuestions) * 100;

    return (
        <div className="game-container">
            {showConfetti && (
                <div className="confetti-container">
                    <Confetti
                        numberOfPieces={300}
                        width={window.innerWidth}
                        height={window.innerHeight}
                        recycle={false}
                        gravity={0.3}
                        initialVelocityY={30}
                        initialVelocityX={15}
                        colors={['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#FF9FF3', '#54A0FF']}
                    />
                </div>
            )}

            {/* Oyundan Çık butonu - sadece oyun başladığında göster */}
            {gameState.isGameStarted && !gameState.isGameFinished && (
                <div className="exit-game-container">
                    <button onClick={handleExitGame} className="exit-game-button">
                        ← Oyundan Çık
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
                    alt="Ülke bayrağı"
                    className="flag-image"
                />
            </div>

            {/* Soru */}
            <h2 className="question-text">
                Bu bayrak hangi ülkeye aittir?
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
                <span>Skor: {gameState.score}</span>
            </div>
        </div>
    );
};

export default Game;
