import { useState, useEffect, useRef } from "react";

/**
 * 변리사 미팅용 — 청구항 1 5단계 파이프라인 시각화 (v2 컬러풀)
 * 출원: 이재오 (2025-12-22) | 변리사: 이경림
 */

// ──────────────────────────────────────────────────────────────
// 5단계 정의 — 단계별 고유 컬러
// ──────────────────────────────────────────────────────────────
const STAGES = [
  {
    no: 1,
    label_ko: "의미 단위 분해",
    label_en: "Semantic Decomposition",
    duration: 7000,
    claim_text:
      "상기 문장형 문제를 구성하는 질문 요소 및 선택지 요소를 의미 단위로 분해하는 단계",
    claim_no: "청구항 1 (a)",
    accent: "#7c3aed",
    accentSoft: "#ede9fe",
    emoji: "✂️",
  },
  {
    no: 2,
    label_ko: "노드·엣지 그래프 변환",
    label_en: "Graph Construction",
    duration: 8000,
    claim_text:
      "상기 질문 요소 및 상기 선택지 요소를 노드로 하고, 상기 노드들 간의 의미적 또는 구조적 관계를 엣지로 하는 복수의 문항 구조로 변환하는 단계",
    claim_no: "청구항 1 (b) + 청구항 3",
    accent: "#ec4899",
    accentSoft: "#fce7f3",
    emoji: "🕸️",
  },
  {
    no: 3,
    label_ko: "신경망 임베딩",
    label_en: "Embedding Generation",
    duration: 7000,
    claim_text:
      "상기 복수의 문항 구조에 신경망 또는 임베딩 기법을 적용하여 질문 요소 임베딩 및 선택지 요소 임베딩을 생성하는 단계",
    claim_no: "청구항 1 (c) + 청구항 5",
    accent: "#0891b2",
    accentSoft: "#cffafe",
    emoji: "🧠",
  },
  {
    no: 4,
    label_ko: "유사도 · 점수 벡터",
    label_en: "Similarity Scoring",
    duration: 7000,
    claim_text:
      "상기 질문 요소 임베딩과 상기 선택지 요소 임베딩 간의 유사도 또는 거리 연산을 수행하여 각 선택지에 대한 점수 벡터를 산출하는 단계",
    claim_no: "청구항 1 (d) + 청구항 6",
    accent: "#16a34a",
    accentSoft: "#dcfce7",
    emoji: "📊",
  },
  {
    no: 5,
    label_ko: "정답 결정",
    label_en: "Answer Determination",
    duration: 6000,
    claim_text:
      "상기 점수 벡터에 기초하여 상기 선택지들 중 하나를 정답으로 결정하는 단계",
    claim_no: "청구항 1 (e) + 청구항 7",
    accent: "#ea580c",
    accentSoft: "#ffedd5",
    emoji: "🎯",
  },
];

const TOTAL_DURATION = STAGES.reduce((s, st) => s + st.duration, 0);

// ──────────────────────────────────────────────────────────────
// 예시 문제
// ──────────────────────────────────────────────────────────────
const PROBLEM = {
  question:
    "권수 N=200, 단면적 A=2cm², 평균 자로 길이 ℓ=10cm 인 환상 솔레노이드에 전류 I=2A 가 흐를 때 자속 Φ 의 값(Wb)은? (μ₀ = 4π×10⁻⁷)",
  question_units: [
    { type: "concept", value: "환상 솔레노이드", role: "대상" },
    { type: "value", value: "N=200", role: "권수" },
    { type: "value", value: "A=2cm²", role: "단면적" },
    { type: "value", value: "ℓ=10cm", role: "자로 길이" },
    { type: "value", value: "I=2A", role: "전류" },
    { type: "concept", value: "자속 Φ", role: "질문" },
  ],
  choices: [
    { no: 1, value: "1.005×10⁻⁵ Wb" },
    { no: 2, value: "2.011×10⁻⁵ Wb", correct: true },
    { no: 3, value: "4.021×10⁻⁵ Wb" },
    { no: 4, value: "8.042×10⁻⁵ Wb" },
  ],
  formula: "Φ = N·μ₀·I·A / ℓ",
};

const NODES = [
  { id: "Q", label: "Φ", type: "question", x: 380, y: 80, kind: "질문노드" },
  { id: "C1", label: "환상 솔레노이드", type: "concept", x: 130, y: 180, kind: "개념노드" },
  { id: "C2", label: "자속", type: "concept", x: 380, y: 180, kind: "개념노드" },
  { id: "F", label: "Φ=NμIA/ℓ", type: "formula", x: 630, y: 180, kind: "수식노드" },
  { id: "V1", label: "N=200", type: "value", x: 60, y: 290, kind: "값노드" },
  { id: "V2", label: "A=2cm²", type: "value", x: 200, y: 290, kind: "값노드" },
  { id: "V3", label: "ℓ=10cm", type: "value", x: 340, y: 290, kind: "값노드" },
  { id: "V4", label: "I=2A", type: "value", x: 480, y: 290, kind: "값노드" },
  { id: "O1", label: "①", type: "option", x: 110, y: 410, kind: "선택지" },
  { id: "O2", label: "②", type: "option", x: 310, y: 410, kind: "선택지", correct: true },
  { id: "O3", label: "③", type: "option", x: 510, y: 410, kind: "선택지" },
  { id: "O4", label: "④", type: "option", x: 680, y: 410, kind: "선택지" },
];

const EDGES = [
  { from: "Q", to: "C2", type: "참조" },
  { from: "Q", to: "F", type: "참조" },
  { from: "C1", to: "F", type: "포함" },
  { from: "C2", to: "F", type: "동등성" },
  { from: "V1", to: "F", type: "계산" },
  { from: "V2", to: "F", type: "계산" },
  { from: "V3", to: "F", type: "계산" },
  { from: "V4", to: "F", type: "계산" },
  { from: "O1", to: "Q", type: "참조" },
  { from: "O2", to: "Q", type: "참조" },
  { from: "O3", to: "Q", type: "참조" },
  { from: "O4", to: "Q", type: "참조" },
];

const NODE_COLOR = {
  question: { fill: "#fef3c7", stroke: "#f59e0b", text: "#92400e" },
  concept: { fill: "#cffafe", stroke: "#06b6d4", text: "#155e75" },
  formula: { fill: "#ede9fe", stroke: "#7c3aed", text: "#5b21b6" },
  value: { fill: "#f1f5f9", stroke: "#64748b", text: "#334155" },
  option: { fill: "#dcfce7", stroke: "#16a34a", text: "#166534" },
};

const EDGE_COLOR = {
  참조: "#06b6d4",
  포함: "#7c3aed",
  계산: "#f59e0b",
  동등성: "#16a34a",
};

// ──────────────────────────────────────────────────────────────
// 메인 컴포넌트
// ──────────────────────────────────────────────────────────────
export default function PatentClaim1Demo() {
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const lastTickRef = useRef(performance.now());
  const rafRef = useRef(null);

  useEffect(() => {
    function tick(now) {
      const dt = now - lastTickRef.current;
      lastTickRef.current = now;
      if (!paused) {
        setElapsed((prev) => {
          const next = prev + dt;
          if (next >= TOTAL_DURATION) {
            setCycleCount((c) => c + 1);
            return 0;
          }
          return next;
        });
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    lastTickRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [paused]);

  let stageIdx = 0;
  let stageElapsed = elapsed;
  for (let i = 0; i < STAGES.length; i++) {
    if (stageElapsed < STAGES[i].duration) {
      stageIdx = i;
      break;
    }
    stageElapsed -= STAGES[i].duration;
  }
  const stage = STAGES[stageIdx];
  const stageProgress = stageElapsed / stage.duration;

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #fef6e4 0%, #fde2e7 25%, #e0e7ff 60%, #ddd6fe 100%)",
        color: "#1e293b",
        fontFamily:
          "'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Blobs stageAccent={stage.accent} />

      <Header
        cycleCount={cycleCount}
        paused={paused}
        setPaused={setPaused}
        stage={stage}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "340px 1fr",
          position: "relative",
          zIndex: 1,
          minHeight: "calc(100vh - 110px)",
        }}
      >
        <ClaimSidebar stageIdx={stageIdx} />

        <div style={{ padding: "32px 40px 40px", position: "relative" }}>
          <StageHeader stage={stage} progress={stageProgress} />

          <div
            style={{
              marginTop: "24px",
              minHeight: "560px",
              background: "rgba(255, 255, 255, 0.75)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.8)",
              borderRadius: "24px",
              padding: "36px",
              position: "relative",
              overflow: "hidden",
              boxShadow: `0 20px 60px -20px ${stage.accent}40, 0 0 0 1px ${stage.accent}20`,
              transition: "box-shadow 0.6s",
            }}
          >
            {stageIdx === 0 && <Stage1 progress={stageProgress} stage={stage} />}
            {stageIdx === 1 && <Stage2 progress={stageProgress} stage={stage} />}
            {stageIdx === 2 && <Stage3 progress={stageProgress} stage={stage} />}
            {stageIdx === 3 && <Stage4 progress={stageProgress} stage={stage} />}
            {stageIdx === 4 && <Stage5 progress={stageProgress} stage={stage} />}
          </div>

          <StageIndicator stageIdx={stageIdx} elapsed={elapsed} />
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// 배경 컬러 블롭
// ──────────────────────────────────────────────────────────────
function Blobs({ stageAccent }) {
  return (
    <>
      <div
        style={{
          position: "fixed",
          top: "-200px",
          right: "-200px",
          width: "600px",
          height: "600px",
          background: `radial-gradient(circle, ${stageAccent}40, transparent 70%)`,
          borderRadius: "50%",
          filter: "blur(40px)",
          pointerEvents: "none",
          transition: "background 1s",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "-200px",
          left: "200px",
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(circle, rgba(124, 58, 237, 0.25), transparent 70%)",
          borderRadius: "50%",
          filter: "blur(60px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "30%",
          left: "10%",
          width: "300px",
          height: "300px",
          background:
            "radial-gradient(circle, rgba(236, 72, 153, 0.18), transparent 70%)",
          borderRadius: "50%",
          filter: "blur(50px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
    </>
  );
}

// ──────────────────────────────────────────────────────────────
// 헤더
// ──────────────────────────────────────────────────────────────
function Header({ cycleCount, paused, setPaused, stage }) {
  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.6)",
        padding: "20px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative",
        zIndex: 10,
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
            fontSize: "11px",
            letterSpacing: "0.2em",
            background: "linear-gradient(90deg, #7c3aed, #ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 700,
            marginBottom: "6px",
          }}
        >
          ◆ PATENT APPLICATION · 2025-12-22 · 이재오
        </div>
        <h1
          style={{
            fontSize: "26px",
            fontWeight: 800,
            margin: 0,
            letterSpacing: "-0.02em",
            color: "#1e293b",
          }}
        >
          문장형 문제 자동 풀이 시스템
          <span
            style={{
              marginLeft: "12px",
              fontSize: "16px",
              fontWeight: 500,
              color: "#64748b",
            }}
          >
            청구항 1 (a)~(e) 시각화
          </span>
        </h1>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "12px",
            color: "#64748b",
            background: "white",
            padding: "8px 14px",
            borderRadius: "999px",
            border: "1px solid #e2e8f0",
          }}
        >
          cycle{" "}
          <span style={{ color: stage.accent, fontWeight: 700 }}>
            #{cycleCount + 1}
          </span>
        </div>
        <button
          onClick={() => setPaused(!paused)}
          style={{
            background: paused
              ? `linear-gradient(135deg, ${stage.accent}, ${stage.accent}dd)`
              : "white",
            color: paused ? "white" : "#1e293b",
            border: paused ? "none" : "1px solid #e2e8f0",
            padding: "10px 22px",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            cursor: "pointer",
            borderRadius: "999px",
            transition: "all 0.2s",
            boxShadow: paused
              ? `0 8px 24px -8px ${stage.accent}80`
              : "0 2px 8px -2px rgba(0,0,0,0.1)",
          }}
        >
          {paused ? "▶ RESUME" : "❚❚ PAUSE"}
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// 좌측 사이드바
// ──────────────────────────────────────────────────────────────
function ClaimSidebar({ stageIdx }) {
  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.55)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255, 255, 255, 0.6)",
        padding: "32px 24px",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "inline-block",
          padding: "6px 14px",
          background: "linear-gradient(135deg, #1e293b, #475569)",
          color: "white",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "10px",
          letterSpacing: "0.2em",
          borderRadius: "999px",
          fontWeight: 700,
          marginBottom: "16px",
        }}
      >
        ★ 청구항 1
      </div>
      <div
        style={{
          fontSize: "12px",
          lineHeight: "1.75",
          color: "#475569",
          marginBottom: "24px",
        }}
      >
        문제 관리 서버에 의해 수행되는, 학습 또는 평가를 목적으로 제공되는
        문장형 문제를 자동으로 풀이하고, 학습자에게 맞춤형 문항을 생성해주기
        위한 방법으로서,
      </div>

      <div>
        {STAGES.map((s, i) => (
          <div
            key={i}
            style={{
              padding: "14px 16px",
              marginBottom: "10px",
              background:
                i === stageIdx
                  ? `linear-gradient(135deg, ${s.accentSoft}, white)`
                  : "rgba(255,255,255,0.5)",
              borderLeft: `3px solid ${
                i === stageIdx ? s.accent : "transparent"
              }`,
              borderRadius: "0 12px 12px 0",
              transition: "all 0.5s",
              boxShadow:
                i === stageIdx ? `0 4px 16px -4px ${s.accent}60` : "none",
              transform: i === stageIdx ? "translateX(4px)" : "translateX(0)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "6px",
              }}
            >
              <span style={{ fontSize: "16px" }}>{s.emoji}</span>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "10px",
                  color: i === stageIdx ? s.accent : "#94a3b8",
                  letterSpacing: "0.1em",
                  fontWeight: 700,
                }}
              >
                ({String.fromCharCode(97 + i)}) {s.label_en}
              </div>
            </div>
            <div
              style={{
                fontSize: "11.5px",
                lineHeight: "1.65",
                color: i === stageIdx ? "#1e293b" : "#64748b",
              }}
            >
              {s.claim_text}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: "24px",
          padding: "18px",
          background: "linear-gradient(135deg, #1e293b, #334155)",
          borderRadius: "16px",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-30px",
            right: "-30px",
            width: "100px",
            height: "100px",
            background: "linear-gradient(135deg, #ec4899, #7c3aed)",
            borderRadius: "50%",
            filter: "blur(20px)",
            opacity: 0.6,
          }}
        />
        <div
          style={{
            position: "relative",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "10px",
            letterSpacing: "0.2em",
            marginBottom: "8px",
            color: "#fbbf24",
            fontWeight: 700,
          }}
        >
          ★ ESSENTIAL BASIS
        </div>
        <div
          style={{ position: "relative", fontSize: "12px", lineHeight: "1.6" }}
        >
          객관식 시험 문제 (질문 + N개 선택지) 의 구조화된 입력 단위를 처리하는
          발명 — US 10,108,604 (텍스트→문제 생성) 과 본질적 차별
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// 단계 헤더
// ──────────────────────────────────────────────────────────────
function StageHeader({ stage, progress }) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            width: "84px",
            height: "84px",
            borderRadius: "20px",
            background: `linear-gradient(135deg, ${stage.accent}, ${stage.accent}cc)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "44px",
            boxShadow: `0 10px 30px -10px ${stage.accent}aa`,
            transition: "all 0.6s",
          }}
        >
          {stage.emoji}
        </div>
        <div>
          <div
            style={{
              display: "inline-block",
              padding: "4px 12px",
              background: stage.accentSoft,
              color: stage.accent,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "10px",
              letterSpacing: "0.18em",
              fontWeight: 700,
              borderRadius: "999px",
              marginBottom: "8px",
            }}
          >
            {stage.claim_no} · STEP {stage.no} / 5
          </div>
          <div
            style={{
              fontSize: "32px",
              fontWeight: 800,
              color: "#1e293b",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            {stage.label_ko}
          </div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "13px",
              color: stage.accent,
              marginTop: "4px",
              letterSpacing: "0.05em",
              fontWeight: 600,
            }}
          >
            {stage.label_en}
          </div>
        </div>
      </div>
      <div
        style={{
          height: "6px",
          background: "rgba(0, 0, 0, 0.05)",
          marginTop: "16px",
          borderRadius: "999px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress * 100}%`,
            background: `linear-gradient(90deg, ${stage.accent}, ${stage.accent}aa)`,
            transition: "width 0.1s linear",
            borderRadius: "999px",
            boxShadow: `0 0 12px ${stage.accent}`,
          }}
        />
      </div>
    </div>
  );
}

function StageIndicator({ stageIdx, elapsed }) {
  return (
    <div
      style={{
        marginTop: "20px",
        display: "flex",
        gap: "6px",
        alignItems: "center",
      }}
    >
      {STAGES.map((s, i) => (
        <div
          key={i}
          style={{
            flex: s.duration,
            height: "44px",
            background:
              i < stageIdx
                ? `linear-gradient(135deg, ${s.accent}, ${s.accent}dd)`
                : i === stageIdx
                ? `linear-gradient(135deg, ${s.accent}, ${s.accent}cc)`
                : "rgba(255,255,255,0.6)",
            color: i <= stageIdx ? "white" : "#94a3b8",
            border:
              i === stageIdx
                ? `2px solid ${s.accent}`
                : "1px solid rgba(255,255,255,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.05em",
            transition: "all 0.4s",
            borderRadius: "12px",
            boxShadow:
              i === stageIdx ? `0 8px 24px -8px ${s.accent}aa` : "none",
            transform: i === stageIdx ? "translateY(-2px)" : "translateY(0)",
            cursor: "default",
          }}
        >
          <span style={{ marginRight: "6px" }}>{s.emoji}</span>
          ({String.fromCharCode(97 + i)}) {s.label_ko}
        </div>
      ))}
      <div
        style={{
          marginLeft: "12px",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "12px",
          color: "#64748b",
          background: "white",
          padding: "8px 14px",
          borderRadius: "999px",
          border: "1px solid #e2e8f0",
        }}
      >
        {(elapsed / 1000).toFixed(1)}s / {(TOTAL_DURATION / 1000).toFixed(0)}s
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 단계 1
// ══════════════════════════════════════════════════════════════
function Stage1({ progress, stage }) {
  const showUnits = progress > 0.4;
  const unitProgress = Math.max(0, (progress - 0.4) / 0.6);

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "32px",
          alignItems: "start",
        }}
      >
        <div>
          <SectionLabel color={stage.accent}>📥 INPUT — 문장형 문제</SectionLabel>
          <div
            style={{
              padding: "24px",
              background: "linear-gradient(135deg, #fef3c7, #fde68a)",
              border: "2px solid #fbbf24",
              borderRadius: "16px",
              fontSize: "16px",
              lineHeight: 1.8,
              color: "#78350f",
              minHeight: "180px",
              fontWeight: 500,
              boxShadow: "0 8px 24px -8px rgba(251, 191, 36, 0.4)",
            }}
          >
            {PROBLEM.question}
          </div>
          <div style={{ marginTop: "20px" }}>
            <SectionLabel color={stage.accent}>📋 선택지</SectionLabel>
            <div style={{ display: "grid", gap: "8px" }}>
              {PROBLEM.choices.map((c) => (
                <div
                  key={c.no}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "13px",
                    padding: "10px 16px",
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    color: "#475569",
                    fontWeight: 500,
                  }}
                >
                  <span style={{ color: stage.accent, fontWeight: 700 }}>
                    ({c.no})
                  </span>{" "}
                  {c.value}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <SectionLabel color={stage.accent}>📤 OUTPUT — 의미 단위</SectionLabel>
          <div
            style={{
              minHeight: "380px",
              position: "relative",
              padding: "20px",
              background:
                "linear-gradient(135deg, rgba(124, 58, 237, 0.05), rgba(236, 72, 153, 0.05))",
              border: "2px dashed #c4b5fd",
              borderRadius: "16px",
            }}
          >
            {showUnits && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {PROBLEM.question_units.map((u, i) => {
                  const delay = (i / PROBLEM.question_units.length) * 0.7;
                  const opacity = Math.max(
                    0,
                    Math.min(1, (unitProgress - delay) * 4)
                  );
                  const translateY = Math.max(0, 30 - opacity * 30);
                  const isValue = u.type === "value";
                  return (
                    <div
                      key={i}
                      style={{
                        opacity,
                        transform: `translateY(${translateY}px) scale(${
                          0.9 + opacity * 0.1
                        })`,
                        padding: "12px 18px",
                        background: isValue
                          ? "linear-gradient(135deg, #cffafe, #a5f3fc)"
                          : "linear-gradient(135deg, #fce7f3, #fbcfe8)",
                        border: `2px solid ${isValue ? "#06b6d4" : "#ec4899"}`,
                        borderRadius: "12px",
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: isValue ? "#155e75" : "#831843",
                        boxShadow: `0 6px 16px -4px ${
                          isValue
                            ? "rgba(6, 182, 212, 0.3)"
                            : "rgba(236, 72, 153, 0.3)"
                        }`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: "9px",
                          letterSpacing: "0.15em",
                          color: isValue ? "#0891b2" : "#be185d",
                          marginBottom: "4px",
                          fontWeight: 700,
                        }}
                      >
                        {u.role}
                      </div>
                      {u.value}
                    </div>
                  );
                })}
              </div>
            )}
            {!showUnits && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "13px",
                  color: stage.accent,
                  letterSpacing: "0.08em",
                  fontWeight: 600,
                }}
              >
                <PulseDot color={stage.accent} /> 형태소 · 토큰 · 개체명 · 의미역
                분석 중...
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNote color={stage.accent}>
        💡 <strong>청구항 2</strong>: 형태소 분석, 토큰화, 개체명 인식, 의미역
        분석을 적용하여 질문 요소(개념·단위)와 선택지 요소(수치·단위)를 분리 추출
      </BottomNote>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 단계 2
// ══════════════════════════════════════════════════════════════
function Stage2({ progress, stage }) {
  const nodeProgress = Math.min(1, progress * 2.5);
  const edgeProgress = Math.max(0, Math.min(1, (progress - 0.4) * 2.2));

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 220px",
          gap: "24px",
        }}
      >
        <div>
          <SectionLabel color={stage.accent}>🕸️ 문항 구조 그래프</SectionLabel>
          <div
            style={{
              background: "linear-gradient(135deg, #fdf2f8, #fce7f3)",
              border: "2px solid #f9a8d4",
              borderRadius: "16px",
              padding: "16px",
              boxShadow: "0 8px 24px -8px rgba(236, 72, 153, 0.3)",
            }}
          >
            <svg viewBox="0 0 760 470" style={{ width: "100%", display: "block" }}>
              <defs>
                {Object.entries(EDGE_COLOR).map(([type, color]) => (
                  <marker
                    key={type}
                    id={`arrow-${type}`}
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto"
                  >
                    <path d="M0,0 L10,5 L0,10 z" fill={color} opacity="0.7" />
                  </marker>
                ))}
              </defs>
              {EDGES.map((e, i) => {
                const from = NODES.find((n) => n.id === e.from);
                const to = NODES.find((n) => n.id === e.to);
                const visible = i / EDGES.length < edgeProgress;
                if (!visible) return null;
                return (
                  <line
                    key={i}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={EDGE_COLOR[e.type]}
                    strokeWidth="2"
                    strokeOpacity="0.55"
                    strokeDasharray={e.type === "참조" ? "5 4" : "0"}
                    markerEnd={`url(#arrow-${e.type})`}
                  />
                );
              })}
              {NODES.map((n, i) => {
                const t = i / NODES.length;
                const opacity = Math.max(
                  0,
                  Math.min(1, (nodeProgress - t) * 5)
                );
                if (opacity <= 0) return null;
                const r = n.type === "question" ? 32 : n.type === "option" ? 24 : 28;
                const c = NODE_COLOR[n.type];
                const scale = 0.7 + opacity * 0.3;
                return (
                  <g
                    key={n.id}
                    opacity={opacity}
                    transform={`translate(${n.x}, ${n.y}) scale(${scale}) translate(${-n.x}, ${-n.y})`}
                  >
                    <circle cx={n.x} cy={n.y} r={r + 4} fill={c.stroke} opacity="0.18" />
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={r}
                      fill={c.fill}
                      stroke={c.stroke}
                      strokeWidth="2.5"
                    />
                    <text
                      x={n.x}
                      y={n.y + 4}
                      textAnchor="middle"
                      fontSize={
                        n.type === "value" || n.type === "formula" ? "11" : "13"
                      }
                      fill={c.text}
                      fontWeight="700"
                      fontFamily="JetBrains Mono, SF Mono, monospace"
                    >
                      {n.label}
                    </text>
                    <text
                      x={n.x}
                      y={n.y + r + 14}
                      textAnchor="middle"
                      fontSize="9"
                      fill={c.text}
                      fontWeight="600"
                      letterSpacing="0.08em"
                    >
                      {n.kind}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        <div>
          <SectionLabel color={stage.accent}>NODE TYPES</SectionLabel>
          {[
            ["질문노드", "question"],
            ["개념노드", "concept"],
            ["수식노드", "formula"],
            ["값노드", "value"],
            ["선택지", "option"],
          ].map(([label, type]) => {
            const c = NODE_COLOR[type];
            return (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 12px",
                  marginBottom: "6px",
                  background: c.fill,
                  borderRadius: "8px",
                  border: `1px solid ${c.stroke}`,
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "white",
                    border: `2.5px solid ${c.stroke}`,
                  }}
                />
                <span style={{ color: c.text, fontSize: "12px", fontWeight: 700 }}>
                  {label}
                </span>
              </div>
            );
          })}

          <div style={{ marginTop: "16px" }}>
            <SectionLabel color={stage.accent}>EDGE TYPES</SectionLabel>
            {[
              ["참조", "dashed"],
              ["포함", "solid"],
              ["계산", "solid"],
              ["동등성", "solid"],
            ].map(([label, lineStyle]) => {
              const color = EDGE_COLOR[label];
              return (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "6px",
                    padding: "6px 10px",
                  }}
                >
                  <svg width="24" height="6">
                    <line
                      x1="0"
                      y1="3"
                      x2="24"
                      y2="3"
                      stroke={color}
                      strokeWidth="2.5"
                      strokeDasharray={lineStyle === "dashed" ? "4 3" : "0"}
                    />
                  </svg>
                  <span style={{ color: color, fontSize: "12px", fontWeight: 700 }}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <BottomNote color={stage.accent}>
        💡 <strong>청구항 3</strong>: 노드는 질문/조건/선택지/개념/수식/값 중 하나,
        엣지는 의존·참조·포함·계산·동등성 관계 중 하나.{" "}
        <strong style={{ color: stage.accent }}>
          ✦ 선택지가 그래프 정식 멤버
        </strong>
        인 점이 US 10,108,604 와의 핵심 차별점.
      </BottomNote>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 단계 3
// ══════════════════════════════════════════════════════════════
function Stage3({ progress, stage }) {
  const VECTOR_DIM = 16;
  const seedVec = (seed, dim) =>
    Array.from({ length: dim }, (_, i) => {
      const x = Math.sin(seed * 13 + i * 7) * 10000;
      return x - Math.floor(x);
    });

  const targets = [
    { label: "질문 임베딩 (Φ)", color: "#7c3aed", bg: "#ede9fe", vec: seedVec(1, VECTOR_DIM) },
    { label: "선택지 ① 임베딩", color: "#16a34a", bg: "#dcfce7", vec: seedVec(2, VECTOR_DIM) },
    { label: "선택지 ② 임베딩", color: "#16a34a", bg: "#dcfce7", vec: seedVec(3, VECTOR_DIM) },
    { label: "선택지 ③ 임베딩", color: "#16a34a", bg: "#dcfce7", vec: seedVec(4, VECTOR_DIM) },
    { label: "선택지 ④ 임베딩", color: "#16a34a", bg: "#dcfce7", vec: seedVec(5, VECTOR_DIM) },
  ];

  return (
    <div>
      <SectionLabel color={stage.accent}>
        🧠 GraphSAGE / GAT 적용 — 노드 → 고차원 벡터
      </SectionLabel>

      <div
        style={{
          padding: "24px",
          background: "linear-gradient(135deg, #ecfeff, #cffafe)",
          border: "2px solid #67e8f9",
          borderRadius: "16px",
          marginTop: "12px",
          boxShadow: "0 8px 24px -8px rgba(8, 145, 178, 0.3)",
        }}
      >
        {targets.map((t, i) => {
          const itemProgress = Math.max(
            0,
            Math.min(1, (progress - i * 0.12) * 3)
          );
          return (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "200px 1fr",
                gap: "20px",
                alignItems: "center",
                padding: "12px 0",
                opacity: itemProgress,
                transform: `translateX(${(1 - itemProgress) * -30}px)`,
                transition: "all 0.3s",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 14px",
                  background: t.bg,
                  borderRadius: "10px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "12px",
                  color: t.color,
                  fontWeight: 700,
                  border: `1.5px solid ${t.color}`,
                }}
              >
                {t.label}
              </div>
              <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                {t.vec.map((v, j) => {
                  const cellOpacity = Math.max(
                    0,
                    Math.min(1, (itemProgress - j / VECTOR_DIM) * 6)
                  );
                  return (
                    <div
                      key={j}
                      style={{
                        flex: 1,
                        height: "36px",
                        background: `linear-gradient(180deg, ${t.color}, ${t.color}cc)`,
                        opacity: v * 0.95 * cellOpacity,
                        borderRadius: "4px",
                      }}
                      title={v.toFixed(3)}
                    />
                  );
                })}
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "11px",
                    color: "#64748b",
                    marginLeft: "12px",
                    fontWeight: 600,
                    minWidth: "70px",
                  }}
                >
                  ℝ^{VECTOR_DIM}…768
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <BottomNote color={stage.accent}>
        💡 <strong>청구항 5</strong>: 그래프 합성곱 신경망(GCN), 그래프 어텐션
        네트워크(GAT), GraphSAGE, Node2Vec, 자기지도 대조학습 중 적어도 하나를 적용.
        질문 임베딩 + 4개 선택지 임베딩 = 총 5개 벡터 생성.
      </BottomNote>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 단계 4
// ══════════════════════════════════════════════════════════════
function Stage4({ progress, stage }) {
  const scores = [
    { no: 1, value: 0.412 },
    { no: 2, value: 0.937, correct: true },
    { no: 3, value: 0.521 },
    { no: 4, value: 0.298 },
  ];

  return (
    <div>
      <SectionLabel color={stage.accent}>
        📊 코사인 유사도 → 점수 벡터 산출
      </SectionLabel>

      <div
        style={{
          marginTop: "12px",
          padding: "28px",
          background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
          border: "2px solid #86efac",
          borderRadius: "16px",
          boxShadow: "0 8px 24px -8px rgba(22, 163, 74, 0.3)",
        }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "14px",
            color: "#166534",
            textAlign: "center",
            padding: "12px 20px",
            background: "white",
            borderRadius: "12px",
            marginBottom: "24px",
            letterSpacing: "0.05em",
            fontWeight: 600,
            boxSizing: "border-box",
          }}
        >
          score(Q, Oᵢ) = cos(e_Q, e_Oᵢ) ·{" "}
          <span style={{ color: "#0891b2" }}>α_난이도</span> ·{" "}
          <span style={{ color: "#0891b2" }}>β_빈도</span>
        </div>

        {scores.map((s, i) => {
          const itemProgress = Math.max(
            0,
            Math.min(1, (progress - i * 0.1) * 2.5)
          );
          const barWidth = s.value * 100 * itemProgress;
          return (
            <div
              key={s.no}
              style={{
                display: "grid",
                gridTemplateColumns: "60px 1fr 100px",
                gap: "16px",
                alignItems: "center",
                padding: "10px 0",
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "20px",
                  color: s.correct ? "#ea580c" : "#475569",
                  fontWeight: 800,
                  textAlign: "center",
                }}
              >
                ({s.no})
              </div>
              <div
                style={{
                  height: "36px",
                  background: "white",
                  position: "relative",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${barWidth}%`,
                    background: s.correct
                      ? "linear-gradient(90deg, #fb923c, #ea580c, #c2410c)"
                      : "linear-gradient(90deg, #67e8f9, #06b6d4, #0891b2)",
                    transition: "width 0.3s ease-out",
                    boxShadow: s.correct
                      ? "0 0 16px rgba(234, 88, 12, 0.5)"
                      : "0 0 8px rgba(8, 145, 178, 0.3)",
                  }}
                />
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "15px",
                  color: s.correct ? "#ea580c" : "#475569",
                  textAlign: "right",
                  fontWeight: 700,
                }}
              >
                {(s.value * itemProgress).toFixed(3)}
              </div>
            </div>
          );
        })}

        <div
          style={{
            marginTop: "24px",
            padding: "14px 18px",
            background: "white",
            border: "2px solid #16a34a",
            borderRadius: "12px",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "13px",
            color: "#166534",
            opacity: progress,
            fontWeight: 600,
          }}
        >
          score_vec = [
          {scores
            .map((s) => (s.value * Math.min(1, progress * 1.5)).toFixed(3))
            .join(", ")}
          ]
        </div>
      </div>

      <BottomNote color={stage.accent}>
        💡 <strong>청구항 6</strong>: 코사인 유사도 또는 유클리드 거리, 난이도
        보정계수 + 문항 빈도 보정계수 적용.{" "}
        <strong style={{ color: stage.accent }}>
          ✦ 1:N 매칭 (질문 1개 ↔ 선택지 N개)
        </strong>{" "}
        구조는 US 10,108,604 (1:N 출력 = 새 문제 생성) 과 정반대 방향.
      </BottomNote>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 단계 5
// ══════════════════════════════════════════════════════════════
function Stage5({ progress, stage }) {
  const showResult = progress > 0.4;
  const resultPulse = showResult
    ? 0.5 + 0.5 * Math.sin((progress - 0.4) * 12)
    : 0;

  return (
    <div>
      <SectionLabel color={stage.accent}>
        🎯 argmax(score_vec) — 점수 벡터 최대값 선택지를 정답으로 결정
      </SectionLabel>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "28px",
          marginTop: "16px",
        }}
      >
        <div
          style={{
            padding: "24px",
            background: "linear-gradient(135deg, #fef3c7, #fde68a)",
            border: "2px solid #f59e0b",
            borderRadius: "16px",
            boxShadow: "0 8px 24px -8px rgba(234, 88, 12, 0.3)",
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "5px 12px",
              background: "white",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
              color: "#92400e",
              fontWeight: 700,
              letterSpacing: "0.1em",
              borderRadius: "999px",
              marginBottom: "16px",
            }}
          >
            INPUT — score_vec
          </div>
          {[
            { no: 1, v: 0.412 },
            { no: 2, v: 0.937, correct: true },
            { no: 3, v: 0.521 },
            { no: 4, v: 0.298 },
          ].map((s) => (
            <div
              key={s.no}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                marginBottom: "8px",
                background: s.correct
                  ? `linear-gradient(135deg, white, rgba(251, 146, 60, ${
                      0.15 + resultPulse * 0.3
                    }))`
                  : "white",
                border: `2px solid ${s.correct ? "#ea580c" : "#fde68a"}`,
                borderRadius: "10px",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "14px",
                color: s.correct ? "#9a3412" : "#78350f",
                fontWeight: s.correct ? 700 : 500,
                transition: "background 0.2s",
                boxShadow: s.correct
                  ? `0 0 ${
                      8 + resultPulse * 12
                    }px rgba(234, 88, 12, ${0.4 + resultPulse * 0.3})`
                  : "none",
              }}
            >
              <span>
                ({s.no}) {PROBLEM.choices.find((c) => c.no === s.no).value}
              </span>
              <span style={{ fontWeight: 700 }}>{s.v.toFixed(3)}</span>
            </div>
          ))}

          <div
            style={{
              marginTop: "20px",
              padding: "12px 16px",
              background: "linear-gradient(135deg, #ea580c, #c2410c)",
              color: "white",
              borderRadius: "10px",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "12px",
              fontWeight: 600,
              boxShadow: "0 6px 16px -4px rgba(234, 88, 12, 0.5)",
            }}
          >
            ▶ argmax → index 2 · 점수 0.937 · Δ=0.416 · 신뢰도 HIGH
          </div>
        </div>

        <div
          style={{
            padding: "28px",
            background:
              "linear-gradient(135deg, #ea580c 0%, #f97316 50%, #fb923c 100%)",
            borderRadius: "16px",
            position: "relative",
            overflow: "hidden",
            color: "white",
            boxShadow: "0 16px 40px -12px rgba(234, 88, 12, 0.6)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-40px",
              right: "-40px",
              width: "180px",
              height: "180px",
              background: "rgba(255, 255, 255, 0.15)",
              borderRadius: "50%",
              filter: "blur(20px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-30px",
              left: "-30px",
              width: "120px",
              height: "120px",
              background: "rgba(251, 191, 36, 0.3)",
              borderRadius: "50%",
              filter: "blur(20px)",
            }}
          />
          <div style={{ position: "relative" }}>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "11px",
                letterSpacing: "0.2em",
                marginBottom: "12px",
                fontWeight: 700,
                opacity: 0.9,
              }}
            >
              ★ OUTPUT — 결정된 정답
            </div>
            <div
              style={{
                fontSize: "96px",
                fontWeight: 800,
                lineHeight: 1,
                marginBottom: "12px",
                opacity: showResult ? 1 : 0.2,
                transform: `scale(${showResult ? 1 : 0.6})`,
                transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                textShadow: showResult ? "0 6px 24px rgba(0,0,0,0.2)" : "none",
              }}
            >
              ②
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "22px",
                opacity: showResult ? 1 : 0.3,
                transition: "opacity 0.4s 0.2s",
                fontWeight: 700,
              }}
            >
              Φ ≈ 2.011 × 10⁻⁵ Wb
            </div>

            <div
              style={{
                marginTop: "20px",
                padding: "14px 16px",
                background: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
                borderRadius: "10px",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                fontSize: "12.5px",
                opacity: showResult ? 1 : 0,
                transition: "opacity 0.4s 0.4s",
                lineHeight: 1.7,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 500,
              }}
            >
              ✓ 검증: Φ = N·μ₀·I·A / ℓ
              <br />
              = 200 · 4π×10⁻⁷ · 2 · 2×10⁻⁴ / 0.1
              <br />= <strong>2.011 × 10⁻⁵ Wb</strong>
            </div>
          </div>
        </div>
      </div>

      <BottomNote color={stage.accent}>
        💡 <strong>청구항 7</strong>: 점수 벡터의 최대값 또는 최소값 기준으로 정답
        결정. 동점 발생 시 난이도 기준 또는 무작위화 규칙 적용.{" "}
        <strong style={{ color: stage.accent }}>
          ✦ 이미 제공된 N개 선택지에서 정답 1개를 선택
        </strong>
        하는 구조 — 새 문제 생성(US 10,108,604)이 아닌 정답 결정.
      </BottomNote>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// 공통
// ──────────────────────────────────────────────────────────────
function SectionLabel({ children, color }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 14px",
        background: "white",
        border: `1.5px solid ${color || "#cbd5e1"}`,
        color: color || "#475569",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "11px",
        letterSpacing: "0.12em",
        fontWeight: 700,
        marginBottom: "12px",
        borderRadius: "999px",
      }}
    >
      {children}
    </div>
  );
}

function BottomNote({ children, color }) {
  return (
    <div
      style={{
        marginTop: "24px",
        padding: "16px 20px",
        background: "white",
        borderLeft: `4px solid ${color || "#06b6d4"}`,
        fontSize: "13px",
        lineHeight: 1.7,
        color: "#334155",
        borderRadius: "0 12px 12px 0",
        boxShadow: "0 4px 12px -4px rgba(0,0,0,0.08)",
      }}
    >
      {children}
    </div>
  );
}

function PulseDot({ color }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: "10px",
        height: "10px",
        background: color,
        borderRadius: "50%",
        marginRight: "10px",
        animation: "pulse 1.5s infinite",
      }}
    >
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 ${color}80; }
          70% { box-shadow: 0 0 0 12px ${color}00; }
          100% { box-shadow: 0 0 0 0 ${color}00; }
        }
      `}</style>
    </span>
  );
}
