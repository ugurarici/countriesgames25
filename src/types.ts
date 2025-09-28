// API'den gelen ülke verisi tipi
export interface Country {
  name: {
    common: string;
    official: string;
  };
  flags: {
    png: string;
    svg: string;
    alt: string;
  };
}

// Oyun sorusu tipi
export interface Question {
  flag: string;
  correctAnswer: string;
  options: string[];
}

// Oyun sonucu tipi
export interface GameResult {
  questionNumber: number;
  flag: string;
  correctAnswer: string;
  userAnswer: string;
  isCorrect: boolean;
}

// Oyun durumu tipi
export interface GameState {
  currentQuestion: number;
  totalQuestions: number;
  score: number;
  questions: Question[];
  results: GameResult[];
  isGameStarted: boolean;
  isGameFinished: boolean;
}

// Local storage'dan yüklenen skor tipi
export interface StoredScore {
  score: number;
  totalQuestions: number;
  date: string;
}
