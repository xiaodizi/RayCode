import React, { useState, useCallback } from "react";
import { Box, Text } from "ink";
import TextInput from "ink-text-input";

interface InputComponentProps {
  onSubmit: (input: string) => void;
  placeholder?: string;
  prefix?: string;
}

export const InputComponent: React.FC<InputComponentProps> = ({
  onSubmit,
  placeholder = "Type your message... (Ctrl+C to exit)",
  prefix = ">",
}) => {
  const [value, setValue] = useState("");

  const handleSubmit = useCallback(
    (input: string) => {
      const trimmed = input.trim();
      if (trimmed) {
        onSubmit(trimmed);
        setValue("");
      }
    },
    [onSubmit],
  );

  return (
    <Box>
      <Box marginRight={1}>
        <Text color="cyan" bold>
          {prefix}
        </Text>
      </Box>
      <TextInput
        value={value}
        onChange={setValue}
        onSubmit={handleSubmit}
        placeholder={placeholder}
        showCursor={true}
      />
    </Box>
  );
};
