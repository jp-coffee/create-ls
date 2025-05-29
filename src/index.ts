import { useCallback, useEffect, useState } from "react";

type LocalStorageAPI<T> = {
  get: () => T | undefined;
  set: (value: T) => void;
  reset: () => void;
  hasValue: () => boolean;
};

const checkLocalStorageAvailable = (): boolean => {
  if (typeof window === "undefined") return false;
  
  try {
    const testKey = "__storage_test__";
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

const safeJSONParse = <T>(value: string): T | undefined => {
  try {
    const parsed = JSON.parse(value);
    if (parsed === null || parsed === undefined) return undefined;
    return parsed as T;
  } catch {
    return value as T;
  }
};

const safeJSONStringify = <T>(value: T): string | undefined => {
  if(typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return undefined;
  }
};

const useFunction = <T>(name: string, initialValue?: T): LocalStorageAPI<T> => {
  const [value, setValue] = useState<T | undefined>(() => {
    if(!checkLocalStorageAvailable()) return initialValue || undefined;

    const stored = localStorage.getItem(name);
    if (!stored) return initialValue || undefined;

    return safeJSONParse<T>(stored) || initialValue || undefined;
  });

  const get = useCallback(() => value, [value]);

  const set = useCallback((newValue: T) => {
    setValue(newValue);

    if(!checkLocalStorageAvailable()) return;

    const serialized = safeJSONStringify(newValue);
    if(!serialized) return;

    localStorage.setItem(name, serialized);
    window.dispatchEvent(new CustomEvent("localStorageChange", { detail: { key: name, newValue: serialized } }));
  }, [name]);

  const reset = useCallback(() => {
    setValue(initialValue || undefined);

    if(!checkLocalStorageAvailable()) return;

    localStorage.removeItem(name);
    window.dispatchEvent(new CustomEvent("localStorageChange", { detail: { key: name, newValue: undefined } }));
  }, [name, initialValue]);

  const hasValue = useCallback(() => value !== undefined && value !== null && value !== "", [value]);

  useEffect(() => {
    if(!checkLocalStorageAvailable()) return;

    const stored = localStorage.getItem(name);
    if (!stored) {
      const serialized = safeJSONStringify(initialValue);
      if(!serialized) return;

      localStorage.setItem(name, serialized);
      window.dispatchEvent(new CustomEvent("localStorageChange", { detail: { key: name, newValue: serialized } }));
      return;
    }

    const parsed = safeJSONParse<T>(stored);
    if (parsed !== undefined && JSON.stringify(parsed) !== JSON.stringify(value)) {
      setValue(parsed);
    }
  }, [name, initialValue, value]);

  useEffect(() => {
    if(!checkLocalStorageAvailable()) return;

    const handleStorageChange = (event: StorageEvent | CustomEvent): void => {
      if (event instanceof StorageEvent) {
        if (event.key === name) {
          if (event.newValue === null) {
            setValue(initialValue || undefined);
          } else {
            const parsed = safeJSONParse<T>(event.newValue);
            if (parsed !== undefined && JSON.stringify(parsed) !== JSON.stringify(value)) {
              setValue(parsed);
            }
          }
      }
    } else if (event instanceof CustomEvent) {
      const { key, newValue } = event.detail;
      if (key === name) {
        const parsed = safeJSONParse<T>(newValue);
        if (parsed !== undefined && JSON.stringify(parsed) !== JSON.stringify(value)) {
          setValue(parsed);
        }
      }
    }
  };

  window.addEventListener("storage", handleStorageChange);
    window.addEventListener("localStorageChange", handleStorageChange as EventListener);
    
    return (): void => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("localStorageChange", handleStorageChange as EventListener);
    };
  }, [name, initialValue, value]);

  return { get, set, reset, hasValue };
};

export { useFunction as createLS };