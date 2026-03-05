import { useState, useCallback } from "react";

interface UseKeyboardOptions {
  itemCount: number;
  onConfirm?: (index: number) => void;
  onCancel?: () => void;
  onViewChange?: (view: 'main' | 'detail' | 'editor') => void;
}

export function useKeyboard(options: UseKeyboardOptions) {
  const { itemCount, onConfirm, onCancel, onViewChange } = options;
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleKey = useCallback((key: string) => {
    switch (key) {
      case "arrowRight":
      case "tab":
        setSelectedIndex((prev) => (prev + 1) % itemCount);
        break;
      case "arrowLeft":
      case "shiftTab":
        setSelectedIndex((prev) => (prev - 1 + itemCount) % itemCount);
        break;
      case "return":
      case "space":
        onConfirm?.(selectedIndex);
        break;
      case "escape":
      case "ctrlC":
        onCancel?.();
        break;
      case "d":
        onViewChange?.('detail');
        break;
      case "e":
        onViewChange?.('editor');
        break;
    }
  }, [itemCount, selectedIndex, onConfirm, onCancel, onViewChange]);

  return {
    selectedIndex,
    setSelectedIndex,
    handleKey,
  };
}
