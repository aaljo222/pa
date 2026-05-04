import { COLORS, FONT, SHADOW } from "../theme.js";

const PATENTS = [
  {
    no: 1,
    color: COLORS.purple,
    code: "P-01",
    title_ko: "전기 산업용 지식 기반 판단 시스템",
    status: "출원",
    claims: "—",
    note: "지식그래프 기반 추론 시스템 우산 특허",
  },
  {
    no: 2,
    color: COLORS.pink,
    code: "P-02",
    title_ko: "학습용 지식 데이터베이스 구축 시스템",
    status: "출원",
    claims: "—",
    note: "Neo4j 5단계 계층 (Subject→Chapter→Topic→Concept→Formula)",
  },
  {
    no: 3,
    color: COLORS.cyan,
    code: "P-03",
    title_ko: "학습 콘텐츠 자동 생성 (3건 묶음)",
    status: "2025-12-22 출원 / 2026-06 등록 예정",
    claims: "20",
    note: "청구항 1: 객관식 자동 풀이 / 청구항 9: 맞춤 문항 생성 / 청구항 19: 역변환 검증",
    highlight: true,
  },
  {
    no: 4,
    color: COLORS.green,
    code: "P-04",
    title_ko: "뉴로-심볼릭 아키텍처 기반 전기 설비 안전 제어 시스템",
    status: "2026-03-18 출원",
    claims: "28",
    note: "P26033KR · 변리사 홍성훈",
  },
  {
    no: 5,
    color: COLORS.orange,
    code: "P-05",
    title_ko: "배터리 열폭주 사전 예측 제어 장치",
    status: "신규 출원 예정",
    claims: "10",
    note: "EIS 기반 · DC Blocking + 4-Wire Kelvin + Galvanic Isolation 3중 하드웨어",
  },
];

export default function PatentsPage() {
  return (
    <div style={{ padding: "60px 40px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 40 }}>
        <div
          style={{
            display: "inline-block",
            padding: "5px 14px",
            background: COLORS.dark,
            color: COLORS.white,
            fontFamily: FONT.mono,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.15em",
            borderRadius: 999,
            marginBottom: 12,
          }}
        >
          ★ PATENT PORTFOLIO
        </div>
        <h1 style={{ fontSize: 44, fontWeight: 800, margin: 0 }}>
          5건 특허 portfolio
        </h1>
        <p style={{ marginTop: 12, fontSize: 16, color: COLORS.textDim }}>
          교육 SaaS + 전기설비 안전 + 배터리 안전 — 3개 영역의 IP 우산
        </p>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {PATENTS.map((p) => (
          <div
            key={p.no}
            style={{
              padding: 28,
              background: COLORS.glass,
              backdropFilter: "blur(20px)",
              borderRadius: 20,
              boxShadow: p.highlight ? SHADOW.glow(p.color) : SHADOW.md,
              borderLeft: `5px solid ${p.color}`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {p.highlight && (
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  padding: "4px 12px",
                  background: p.color,
                  color: COLORS.white,
                  fontFamily: FONT.mono,
                  fontSize: 10,
                  fontWeight: 700,
                  borderRadius: 999,
                }}
              >
                ◆ FEATURED
              </div>
            )}
            <div
              style={{
                fontFamily: FONT.mono,
                fontSize: 11,
                color: p.color,
                fontWeight: 700,
                letterSpacing: "0.15em",
                marginBottom: 8,
              }}
            >
              {p.code}
            </div>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 800,
                margin: 0,
                marginBottom: 12,
                color: COLORS.text,
              }}
            >
              {p.title_ko}
            </h2>
            <div style={{ display: "flex", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
              <Tag>{p.status}</Tag>
              <Tag>청구항 {p.claims}개</Tag>
            </div>
            <div style={{ fontSize: 14, color: COLORS.textDim, lineHeight: 1.6 }}>
              {p.note}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Tag({ children }) {
  return (
    <span
      style={{
        padding: "4px 12px",
        background: COLORS.white,
        borderRadius: 999,
        fontFamily: FONT.mono,
        fontSize: 11,
        color: COLORS.textDim,
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}
