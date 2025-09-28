import { Country, Question, GameResult } from '../types';

// Rastgele sayı üretme
const getRandomInt = (max: number): number => {
  return Math.floor(Math.random() * max);
};

// Array'den rastgele eleman seçme
const getRandomElement = <T>(array: T[]): T => {
  return array[getRandomInt(array.length)];
};

// Array'den rastgele n eleman seçme (tekrarsız)
const getRandomElements = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Oyun sorusu oluşturma
export const createQuestion = (countries: Country[]): Question => {
  // Rastgele bir ülke seç (doğru cevap)
  const correctCountry = getRandomElement(countries);

  // Yanlış cevaplar için 3 farklı ülke seç
  const wrongCountries = getRandomElements(
    countries.filter(country => country.name.common !== correctCountry.name.common),
    3
  );

  // Tüm seçenekleri birleştir ve karıştır
  const allOptions = [
    correctCountry.name.common,
    ...wrongCountries.map(country => country.name.common)
  ].sort(() => 0.5 - Math.random());

  return {
    flag: correctCountry.flags.png, // Use PNG instead of SVG for better compatibility
    correctAnswer: correctCountry.name.common,
    options: allOptions
  };
};

// Oyun sorularını oluşturma
export const createQuestions = (countries: Country[], totalQuestions: number = 20): Question[] => {
  const questions: Question[] = [];

  for (let i = 0; i < totalQuestions; i++) {
    questions.push(createQuestion(countries));
  }

  return questions;
};

// Cevap kontrolü
export const checkAnswer = (userAnswer: string, correctAnswer: string): boolean => {
  return userAnswer === correctAnswer;
};

// Oyun sonucu oluşturma
export const createGameResult = (
  questionNumber: number,
  question: Question,
  userAnswer: string
): GameResult => {
  return {
    questionNumber,
    flag: question.flag,
    correctAnswer: question.correctAnswer,
    userAnswer,
    isCorrect: checkAnswer(userAnswer, question.correctAnswer)
  };
};

// Skor hesaplama
export const calculateScore = (results: GameResult[]): number => {
  return results.filter(result => result.isCorrect).length;
};

// Yüzde hesaplama
export const calculatePercentage = (score: number, total: number): number => {
  return Math.round((score / total) * 100);
};
