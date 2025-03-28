import { useCallback, useEffect, useState } from "react";

type LocalStorageAPI<T> = {
  get: () => T;
  set: (value: T) => void;
  reset: () => void;
  hasValue: () => boolean;
};

const useFunction = <T>(name: string, initialValue: T): LocalStorageAPI<T> => {
  const [value, setStateValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    const storedValue = localStorage.getItem(name);
    if (storedValue !== null) {
      try {
        return JSON.parse(storedValue) as T;
      } catch {
        console.error(`Failed to parse stored value for key "${name}". Returning initial value.`);
        return initialValue;
      }
    }
    return initialValue;
  });

  const get = useCallback(() => value, [value]);

  const set = useCallback(
    (newValue: T) => {
      setStateValue(newValue);
      if (typeof window !== "undefined") {
        localStorage.setItem(name, typeof newValue === "string" ? newValue : JSON.stringify(newValue));
      }
    },
    [name]
  );

  const reset = useCallback(() => {
    setStateValue(initialValue);
    if (typeof window !== "undefined") {
      localStorage.setItem(name, typeof initialValue === "string" ? initialValue : JSON.stringify(initialValue));
    }
  }, [name, initialValue]);

  const hasValue = useCallback(() => value !== "", [value]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedValue = localStorage.getItem(name);
    if (storedValue !== null && storedValue !== value) {
      if (typeof storedValue === "string") {
        setStateValue(storedValue as unknown as T);
      } else {
        setStateValue(storedValue);
      }
    }
  }, [name, value]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (event: StorageEvent): void => {
      if (event.key === name && event.newValue !== value) {
        if (event.newValue) {
          try {
            setStateValue(JSON.parse(event.newValue) as T);
          } catch {
            setStateValue(event.newValue as unknown as T);
          }
        } else {
          setStateValue(initialValue || "" as unknown as T);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return (): void => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [initialValue, name, value]);

  return {
    get,
    set,
    reset,
    hasValue,
  };
};

export { useFunction as createLS };