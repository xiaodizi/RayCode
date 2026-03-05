import { Text, Box } from "ink";
import type { ButtonConfig } from "../types.js";

interface ActionButtonsProps {
  buttons: ButtonConfig[];
  selectedIndex: number;
}

const buttonStyles = {
  primary: { bg: "#7c3aed", fg: "#ffffff" },
  danger: { bg: "#dc2626", fg: "#ffffff" },
  secondary: { bg: "#4b5563", fg: "#ffffff" },
};

export function ActionButtons({ buttons, selectedIndex }: ActionButtonsProps) {
  return (
    <Box gap={2} marginTop={1}>
      {buttons.map((button, index) => {
        const isSelected = index === selectedIndex;
        const style = buttonStyles[button.variant];

        return (
          <Box
            key={index}
            backgroundColor={isSelected ? style.bg : "#1f2937"}
            borderStyle={isSelected ? "round" : "single"}
            borderColor={isSelected ? "#a78bfa" : "#4b5563"}
            paddingX={2}
            paddingY={1}
          >
            <Text color={isSelected ? style.fg : "#9ca3af"} bold={isSelected}>
              {button.shortcut && <Text color="#60a5fa">[{button.shortcut}]</Text>}
              {button.shortcut && " "}
              {button.label}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}
