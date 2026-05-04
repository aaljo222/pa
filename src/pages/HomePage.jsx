import { Link } from "react-router-dom";
import { COLORS, FONT, SHADOW } from "../theme.js";

export default function HomePage() {
  return (
    <div style={{ padding: "60px 40px", maxWidth: 1100, margin: "0 auto" }}>
      {/* 히어로 */}
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <div
          style={{
            display: "inline-block",
            padding: "6px 16px",
            background: COLORS.white,
            borderRadius: "999px",
            fontFamily: FONT.mono,
            fontSize: 11,
            color: COLORS.purple,
            fontWeight: 700,
            letterSpacing: "0.15em",
            marginBottom: 24,
            boxShadow: SHADOW.sm,
          }}
        >
          ◆ PATENT-PROTECTED · 5 FILINGS · 2026
        </div>
        <h1
          style={{
            fontSize: 56,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            margin: 0,
            background: `linear-gradient(135deg, ${COLORS.dark}, ${COLORS.purple} 50%, ${COLORS.pink})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          청구항을 시연합니다.
          <br />
          종이가 아니라 코드로.
        </h1>
        <p
          style={{
            fontSize: 18,
            color: COLORS.textDim,
            marginTop: 24,
            lineHeight: 1.6,
            maxWidth: 700,
            margin: "24px auto 0",
          }}
        >
          (주)에이아이컴퍼니의 5건 특허 portfolio 중 핵심 청구항이
          <br />
          실제로 어떻게 동작하는지 시각화 + 라이브 데모로 보여드립니다.
        </p>
      </div>

      {/* CTA 카드 2개 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          marginBottom: 60,
        }}
      >
        <CTACard
          to="/demo/claim1"
          accent={COLORS.purple}
          accentSoft="#ede9fe"
          eyebrow="STEP 01"
          title="청구항 1 — 5단계 파이프라인"
          desc="문장형 문제 → 의미 분해 → 그래프 → 임베딩 → 유사도 → 정답 결정. 35초 자동 재생."
          tag="35s · 애니메이션"
        />
        <CTACard
          to="/demo/live"
          accent={COLORS.orange}
          accentSoft="#ffedd5"
          eyebrow="STEP 02"
          title="라이브 진단 — 실제 동작"
          desc="1,200문항 메타에서 12개 진단 문제 선정 → AI가 본문 신규 작성 → 청구항 19 역변환 검증."
          tag="라이브 · 백엔드 연결"
        />
      </div>

      {/* 특허 5건 미리보기 */}
      <div
        style={{
          padding: 32,
          background: COLORS.glass,
          backdropFilter: "blur(20px)",
          borderRadius: 24,
          boxShadow: SHADOW.md,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: FONT.mono,
                fontSize: 11,
                color: COLORS.textDim,
                letterSpacing: "0.15em",
                marginBottom: 4,
                fontWeight: 700,
              }}
            >
              ★ PATENT PORTFOLIO
            </div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>
              5건 특허 (2026 출원/등록)
            </div>
          </div>
          <Link
            to="/patents"
            style={{
              padding: "10px 20px",
              background: COLORS.dark,
              color: COLORS.white,
              borderRadius: 999,
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            전체 보기 →
          </Link>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 8,
          }}
        >
          {[
            { color: COLORS.purple, label: "P-01", name: "지식 기반 판단" },
            { color: COLORS.pink, label: "P-02", name: "학습 DB 구축" },
            { color: COLORS.cyan, label: "P-03", name: "콘텐츠 자동 생성 (3건 묶음)" },
            { color: COLORS.green, label: "P-04", name: "뉴로심볼릭 안전제어" },
            { color: COLORS.orange, label: "P-05", name: "배터리 열폭주 예측" },
          ].map((p) => (
            <div
              key={p.label}
              style={{
                padding: 14,
                background: COLORS.white,
                borderRadius: 12,
                borderLeft: `4px solid ${p.color}`,
              }}
            >
              <div
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 10,
                  color: p.color,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                }}
              >
                {p.label}
              </div>
              <div style={{ fontSize: 12, marginTop: 4, fontWeight: 600 }}>
                {p.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CTACard({ to, accent, accentSoft, eyebrow, title, desc, tag }) {
  return (
    <Link
      to={to}
      style={{
        display: "block",
        padding: 32,
        background: COLORS.glass,
        backdropFilter: "blur(20px)",
        borderRadius: 24,
        textDecoration: "none",
        color: COLORS.text,
        boxShadow: SHADOW.md,
        border: `1px solid ${accent}30`,
        transition: "all 0.3s",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = SHADOW.glow(accent);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = SHADOW.md;
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 120,
          height: 120,
          background: `radial-gradient(circle, ${accent}30, transparent 70%)`,
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          display: "inline-block",
          padding: "4px 12px",
          background: accentSoft,
          color: accent,
          fontFamily: FONT.mono,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.15em",
          borderRadius: 999,
          marginBottom: 16,
        }}
      >
        {eyebrow}
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 800,
          lineHeight: 1.2,
          marginBottom: 12,
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 14, color: COLORS.textDim, lineHeight: 1.6 }}>
        {desc}
      </div>
      <div
        style={{
          marginTop: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: FONT.mono,
            fontSize: 11,
            color: accent,
            fontWeight: 700,
          }}
        >
          {tag}
        </span>
        <span
          style={{
            fontSize: 18,
            color: accent,
            fontWeight: 700,
          }}
        >
          →
        </span>
      </div>
    </Link>
  );
}
