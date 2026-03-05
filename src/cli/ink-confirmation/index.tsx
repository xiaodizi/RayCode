import { Text, Box, useInput, useApp } from "ink";
import { RiskBadge } from "./components/RiskBadge.js";
import { ActionButtons } from "./components/ActionButtons.js";
import { useConfirmation } from "./hooks/useConfirmation.js";
import { useKeyboard } from "./hooks/useKeyboard.js";
import type { ConfirmationRequest, ConfirmationResult } from "../../core/confirmation-guard.js";

interface ConfirmationDialogProps {
  request: ConfirmationRequest;
  onResult: (result: ConfirmationResult) => void;
}

export function ConfirmationDialog({ request, onResult }: ConfirmationDialogProps) {
  const { exit } = useApp();
  const { state, setView, confirm, cancel } = useConfirmation(request);

  const buttons = [
    {
      label: "Yes, execute",
      shortcut: "Y",
      variant: "primary" as const,
      action: () => {
        onResult(confirm());
        exit();
      },
    },
    {
      label: "No, cancel",
      shortcut: "N",
      variant: "danger" as const,
      action: () => {
        onResult(cancel());
        exit();
      },
    },
  ];

  const { selectedIndex, handleKey } = useKeyboard({
    itemCount: buttons.length,
    onConfirm: (index) => buttons[index].action(),
    onCancel: () => {
      onResult(cancel());
      exit();
    },
    onViewChange: setView,
  });

  useInput((input, key) => {
    if (key.leftArrow) handleKey("arrowLeft");
    else if (key.rightArrow || key.tab) handleKey("arrowRight");
    else if (key.return) handleKey("return");
    else if (key.escape) handleKey("escape");
    else if (input.toLowerCase() === "y") buttons[0].action();
    else if (input.toLowerCase() === "n") buttons[1].action();
    else if (input.toLowerCase() === "d") setView("detail");
    else if (input.toLowerCase() === "e") setView("editor");
  });

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="#4b5563" padding={1}>
      <Box marginBottom={1}>
        <RiskBadge risk={state.analysis.risk} />
        <Box marginLeft={2}>
          <Text bold color="#e5e7eb">
            Command Confirmation Required
          </Text>
        </Box>
      </Box>

      <Box flexDirection="column" marginY={1}>
        <Text color="#9ca3af">Command:</Text>
        <Box marginTop={1} backgroundColor="#1f2937" paddingX={2} paddingY={1}>
          <Text color="#fbbf24" bold>
            ❯ {state.editedCommand}
          </Text>
        </Box>
      </Box>

      <Box flexDirection="column" marginY={1}>
        <Text color="#f59e0b" bold>Risk Factors:</Text>
        {state.analysis.reasons.map((reason, i) => (
          <Box key={i} marginLeft={2}>
            <Text color="#e5e7eb">• {reason}</Text>
          </Box>
        ))}
      </Box>

      <Box marginY={1}>
        <Text bold color="#e5e7eb">Choose an action:</Text>
      </Box>

      <ActionButtons buttons={buttons} selectedIndex={selectedIndex} />

      <Box marginTop={2}>
        <Text color="#6b7280">
          Use ← → or Tab to navigate, Enter to select, Y/N for quick answer
        </Text>
      </Box>
    </Box>
  );
}
