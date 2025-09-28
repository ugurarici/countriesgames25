import { StoredScore } from '../types';

// Skor kaydetme
export const saveScore = (score: number, totalQuestions: number): void => {
  try {
    const scoreData: StoredScore = {
      score,
      totalQuestions,
      date: new Date().toISOString()
    };

    localStorage.setItem('flagGameScore', JSON.stringify(scoreData));
  } catch (error) {
    console.error('Error saving score:', error);
  }
};

// Skor yükleme
export const loadScore = (): StoredScore | null => {
  try {
    const stored = localStorage.getItem('flagGameScore');
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  } catch (error) {
    console.error('Error loading score:', error);
    return null;
  }
};

// En iyi skor kaydetme
export const saveBestScore = (score: number, totalQuestions: number): void => {
  try {
    const currentBest = loadBestScore();
    const currentPercentage = Math.round((score / totalQuestions) * 100);
    const bestPercentage = currentBest ? Math.round((currentBest.score / currentBest.totalQuestions) * 100) : 0;

    // Eğer mevcut skor daha iyiyse kaydet
    if (!currentBest || currentPercentage > bestPercentage) {
      const scoreData: StoredScore = {
        score,
        totalQuestions,
        date: new Date().toISOString()
      };

      localStorage.setItem('flagGameBestScore', JSON.stringify(scoreData));
    }
  } catch (error) {
    console.error('Error saving best score:', error);
  }
};

// En iyi skor yükleme
export const loadBestScore = (): StoredScore | null => {
  try {
    const stored = localStorage.getItem('flagGameBestScore');
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  } catch (error) {
    console.error('Error loading best score:', error);
    return null;
  }
};
