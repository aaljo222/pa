import { COLORS, FONT, SHADOW } from "../theme.js";

export default function AboutPage() {
  return (
    <div style={{ padding: "60px 40px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 44, fontWeight: 800, margin: 0 }}>
          (주)에이아이컴퍼니
        </h1>
        <p style={{ marginTop: 12, fontSize: 16, color: COLORS.textDim }}>
          AI · 전기 산업용 지식 시스템 · 배터리 안전
        </p>
      </div>

      <Section title="회사 개요">
        <Field label="대표">이재오</Field>
        <Field label="구성">2인 (CEO + 연구원 1명) · 변리사 자문 1명</Field>
        <Field label="설립">2024</Field>
        <Field label="주요 사업">
          AI 기반 한국 전기기사 자격증 학습 플랫폼 + 배터리 열폭주 사전 예측
          시스템 (KOSHA R&D)
        </Field>
      </Section>

      <Section title="대표 약력">
        <Field label="삼성전자 DM연구소 VIDEO LAB">
          책임연구원 · 10년 6개월
        </Field>
        <Field label="미래특허기술 조사분석팀">부장 · 8년 11개월</Field>
        <Field label="현재">
          AI 강의 8년차 · 정규 과정 15개 · 평점 4.5+
        </Field>
        <Field label="학력">광운대학교 전자통신공학</Field>
      </Section>

      <Section title="기술 자산">
        <Field label="특허">5건 (2026 출원/등록 진행)</Field>
        <Field label="플랫폼">
          FastAPI · React 19 · Neo4j · Supabase · Cloudflare R2 · Railway · Vercel
        </Field>
        <Field label="AI 워크플로우">
          TRICORE AI — 자체 구축 HITL workflow (Claude/GPT/Gemini 멀티모델 라우팅)
        </Field>
        <Field label="하드웨어">
          STM32H563ZI + AFE PCB + DLIA 알고리즘 (배터리 EIS 측정)
        </Field>
      </Section>

      <Section title="연락처">
        <Field label="회사 위치">수원시 영통구</Field>
        <Field label="배포 도메인">
          <a href="https://elecai.co.kr" style={{ color: COLORS.purple }}>
            elecai.co.kr
          </a>
        </Field>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div
      style={{
        padding: 32,
        background: COLORS.glass,
        backdropFilter: "blur(20px)",
        borderRadius: 20,
        marginBottom: 20,
        boxShadow: SHADOW.sm,
      }}
    >
      <h2
        style={{
          fontSize: 18,
          fontWeight: 800,
          margin: 0,
          marginBottom: 20,
          color: COLORS.purple,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h2>
      <div style={{ display: "grid", gap: 14 }}>{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 16 }}>
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 11,
          color: COLORS.textDim,
          fontWeight: 700,
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.6 }}>
        {children}
      </div>
    </div>
  );
}
