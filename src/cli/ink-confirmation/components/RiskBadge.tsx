import { Text, Box } from "ink";
import type { RiskLevel } from "../../confirmation-ui.js";

interface RiskBadgeProps {
  risk: RiskLevel;
}

const riskStyles: Record<RiskLevel, { bg: string; fg: string; icon: string }> = {
  high: { bg: "#7f1d1d", fg: "#fef2f2", icon: "⚠️" },
  medium: { bg: "#78350f", fg: "#fffbeb", icon: "⚡" },
  low: { bg: "#14532d", fg: "#f0fdf4", icon: "✓" },
};

export function RiskBadge({ risk }: RiskBadgeProps) {
  const style = riskStyles[risk];
  const label = risk.toUpperCase();

  return (
    <Box backgroundColor={style.bg} paddingX={1} paddingY={1}>
      <Text color={style.fg} bold>
        {style.icon} {label} RISK
      </Text>
    </Box>
  );
}
