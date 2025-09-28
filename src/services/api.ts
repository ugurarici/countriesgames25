import { Country } from '../types';

const API_BASE_URL = 'https://restcountries.com/v3.1';

// API'den ülke verilerini çekme
export const fetchCountries = async (): Promise<Country[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/all?fields=name,flags`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const countries: Country[] = await response.json();
    return countries;
  } catch (error) {
    console.error('Error fetching countries:', error);
    throw error;
  }
};

// Local storage'dan ülke verilerini yükleme
export const loadCountriesFromStorage = (): Country[] | null => {
  try {
    const stored = localStorage.getItem('countriesData');
    if (stored) {
      const data = JSON.parse(stored);
      // Veri 24 saatten eskiyse null döndür
      if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
        return null;
      }
      return data.countries;
    }
    return null;
  } catch (error) {
    console.error('Error loading countries from storage:', error);
    return null;
  }
};

// Ülke verilerini local storage'a kaydetme
export const saveCountriesToStorage = (countries: Country[]): void => {
  try {
    const data = {
      countries,
      timestamp: Date.now()
    };
    localStorage.setItem('countriesData', JSON.stringify(data));
  } catch (error) {
    console.error('Error saving countries to storage:', error);
  }
};

// Ülke verilerini yükleme (önce cache'den, sonra API'den)
export const loadCountries = async (): Promise<Country[]> => {
  // Önce local storage'dan yüklemeyi dene
  const cachedCountries = loadCountriesFromStorage();
  if (cachedCountries) {
    return cachedCountries;
  }

  // Cache'de yoksa API'den çek
  const countries = await fetchCountries();
  saveCountriesToStorage(countries);
  return countries;
};
