import { useState, useEffect } from 'react';
import { APP_CONFIG } from '../config/app';

/**
 * Custom hook for debouncing values
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds (defaults to app config)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set the debounced value after the delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay ?? APP_CONFIG.performance.searchDebounceDelay);

    // Clear the timeout on cleanup
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for debounced search functionality
 * @param searchCallback - The function to call when search should be performed
 * @param delay - The delay in milliseconds (defaults to app config)
 * @returns [searchTerm, setSearchTerm, debouncedSearchTerm, isSearching]
 */
export function useDebouncedSearch(
  searchCallback: (searchTerm: string) => Promise<void> | void,
  delay?: number
) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, delay);

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchTerm !== searchTerm) {
        return; // Don't search if the term has changed since debouncing started
      }

      setIsSearching(true);
      try {
        await searchCallback(debouncedSearchTerm);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    };

    // Only search when there's a debounced search term or when clearing search
    if (debouncedSearchTerm.trim() || (!debouncedSearchTerm && searchTerm !== debouncedSearchTerm)) {
      performSearch();
    }
  }, [debouncedSearchTerm, searchCallback]);

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    isSearching,
  };
}