import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";

import { createLS } from "../index";

describe("useLocalStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  
  it("should initialize with the undefined value if no value is in localStorage", () => {
    const { result } = renderHook(() => createLS("testKey"));
    expect(result.current.get()).toBe(undefined);
  });

  it("should update the undefined value with the new value if the value is set", () => {
    const { result } = renderHook(() => createLS("testKey"));
    expect(result.current.get()).toBe(undefined);

    act(() => {
      result.current.set("newValue");
    });

    expect(result.current.get()).toBe("newValue");
  });

  it("should initialize with the initial value if no value is in localStorage", () => {
    const { result } = renderHook(() => createLS("testKey", "initialValue"));

    expect(result.current.get()).toBe("initialValue");
  });

  it("should initialize with the initial value if no value is in localStorage", () => {
    const { result } = renderHook(() => createLS("testKey", true));

    expect(result.current.get()).toBe(true);
  });

  it("should initialize with the initial value if no value is in localStorage", () => {
    const { result } = renderHook(() => createLS("testKey", 123));

    expect(result.current.get()).toBe(123);
  });

  it("should initialize with the value from localStorage if it exists", () => {
    localStorage.setItem("testKey", "storedValue");
    const { result } = renderHook(() => createLS("testKey", "initialValue"));

    expect(result.current.get()).toBe("storedValue");
  });

  it("should update the value and localStorage when setValue is called", () => {
    const { result } = renderHook(() => createLS("testKey", "initialValue"));

    expect(result.current.get()).toBe("initialValue");

    act(() => {
      result.current.set("newValue");
    });

    expect(result.current.get()).toBe("newValue");
    expect(localStorage.getItem("testKey")).toBe("newValue");
  });

  it("should update the state when localStorage changes externally", () => {
    const { result } = renderHook(() => createLS("testKey", "initialValue"));

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", { key: "testKey", newValue: "externalValue" })
      );
    });

    setTimeout(() => {
      expect(result.current.get()).toBe("externalValue");
    }, 100);
  });

  it("should work with multiple useLocalStorage instances independently", () => {
    const { result: result1 } = renderHook(() => createLS("key1", "value1"));
    const { result: result2 } = renderHook(() => createLS("key2", "value2"));

    expect(result1.current.get()).toBe("value1");
    expect(result2.current.get()).toBe("value2");

    act(() => {
      result1.current.set("newValue1");
    });
    act(() => {
      result2.current.set("newValue2");
    });
    
    expect(result1.current.get()).toBe("newValue1");
    expect(result2.current.get()).toBe("newValue2");
  });

  it("should reset the value to the initial value when reset is called", () => {
    const { result } = renderHook(() => createLS("testKey", "initialValue"));

    expect(result.current.get()).toBe("initialValue");

    act(() => {
      result.current.set("newValue");
    });
    expect(result.current.get()).toBe("newValue");

    act(() => {
      result.current.reset();
    });
    expect(result.current.get()).toBe("initialValue");
  });
});
