// 공통 디자인 토큰 — 모든 페이지에서 import
export const COLORS = {
  // 베이스
  bg: "linear-gradient(135deg, #fef6e4 0%, #fde2e7 25%, #e0e7ff 60%, #ddd6fe 100%)",
  text: "#1e293b",
  textDim: "#64748b",
  border: "#e2e8f0",
  white: "#ffffff",
  glass: "rgba(255, 255, 255, 0.75)",
  glassDim: "rgba(255, 255, 255, 0.55)",

  // 액센트 (5단계 = 5건 특허와 매칭)
  purple: "#7c3aed",
  pink: "#ec4899",
  cyan: "#0891b2",
  green: "#16a34a",
  orange: "#ea580c",
  amber: "#f59e0b",

  // 다크
  dark: "#1e293b",
  darkSoft: "#334155",
};

export const FONT = {
  body: "'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', system-ui, sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', Menlo, monospace",
};

export const SHADOW = {
  sm: "0 4px 12px -4px rgba(0,0,0,0.08)",
  md: "0 8px 24px -8px rgba(0,0,0,0.12)",
  lg: "0 16px 40px -12px rgba(0,0,0,0.18)",
  glow: (color) => `0 0 24px ${color}40, 0 8px 24px -8px ${color}80`,
};
