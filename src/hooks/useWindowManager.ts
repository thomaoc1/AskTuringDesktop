import { useState, useCallback } from "react";
import { windowManager, WindowLabel } from "../services/WindowManager";

export function useWindowManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const wrapOperation = useCallback(async <T,>(
    operation: () => Promise<T>
  ): Promise<T | undefined> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await operation();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error('Window operation failed:', error);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    show: useCallback((label: WindowLabel) =>
      wrapOperation(() => windowManager.show(label)), [wrapOperation]),

    hide: useCallback((label: WindowLabel) =>
      wrapOperation(() => windowManager.hide(label)), [wrapOperation]),

    toggle: useCallback((label: WindowLabel) =>
      wrapOperation(() => windowManager.toggle(label)), [wrapOperation]),

    resize: useCallback((label: WindowLabel, height: number) =>
      wrapOperation(() => windowManager.resize(label, height)), [wrapOperation]),

    switchWindows: useCallback((from: WindowLabel, to: WindowLabel) =>
      wrapOperation(() => windowManager.switchWindows(from, to)), [wrapOperation]),

    navigate: useCallback((to: WindowLabel) =>
      wrapOperation(() => windowManager.navigate(to)), [wrapOperation]),

    handleLogout: useCallback(() =>
      wrapOperation(() => windowManager.handleLogout()), [wrapOperation]),

    handleLogin: useCallback(() =>
      wrapOperation(() => windowManager.handleLogin()), [wrapOperation]),

    getConfig: useCallback((label: WindowLabel) =>
      windowManager.getConfig(label), []),

    isAuthRequired: useCallback((label: WindowLabel) =>
      windowManager.isAuthRequired(label), []),

    isLoading,
    error,
  };
}
