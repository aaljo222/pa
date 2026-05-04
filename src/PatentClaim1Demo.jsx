import { useState, useEffect, useRef } from "react";

/**
 * 변리사 미팅용 — 청구항 1 5단계 파이프라인 시각화
 *
 * 예시 문제: 전기기사 전기자기학 — 코일 자속 계산
 * "권수 N=200, 단면적 A=2cm², 길이 ℓ=10cm 인 환상 솔레노이드에
 *  전류 I=2A 가 흐를 때 자속 Φ 의 값은?"
 *
 * 5단계 자동 재생:
 *   ① 의미 단위 분해 (질문 요소 + 선택지 요소)  — 7초
 *   ② 노드/엣지 문항 구조 변환                — 8초
 *   ③ 신경망 임베딩 생성                       — 7초
 *   ④ 유사도 연산 → 점수 벡터 산출             — 7초
 *   ⑤ 점수 벡터 기반 정답 결정                 — 6초
 * 총 35초 사이클, 무한 반복.
 */

// ──────────────────────────────────────────────────────────────
// 5단계 정의
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
  },
  {
    no: 2,
    label_ko: "노드·엣지 문항 구조 변환",
    label_en: "Graph Construction",
    duration: 8000,
    claim_text:
      "상기 질문 요소 및 상기 선택지 요소를 노드로 하고, 상기 노드들 간의 의미적 또는 구조적 관계를 엣지로 하는 복수의 문항 구조로 변환하는 단계",
    claim_no: "청구항 1 (b) + 청구항 3",
  },
  {
    no: 3,
    label_ko: "신경망 임베딩 생성",
    label_en: "Embedding Generation",
    duration: 7000,
    claim_text:
      "상기 복수의 문항 구조에 신경망 또는 임베딩 기법을 적용하여 질문 요소 임베딩 및 선택지 요소 임베딩을 생성하는 단계",
    claim_no: "청구항 1 (c) + 청구항 5",
  },
  {
    no: 4,
    label_ko: "유사도 연산 · 점수 벡터",
    label_en: "Similarity Scoring",
    duration: 7000,
    claim_text:
      "상기 질문 요소 임베딩과 상기 선택지 요소 임베딩 간의 유사도 또는 거리 연산을 수행하여 각 선택지에 대한 점수 벡터를 산출하는 단계",
    claim_no: "청구항 1 (d) + 청구항 6",
  },
  {
    no: 5,
    label_ko: "정답 결정",
    label_en: "Answer Determination",
    duration: 6000,
    claim_text:
      "상기 점수 벡터에 기초하여 상기 선택지들 중 하나를 정답으로 결정하는 단계",
    claim_no: "청구항 1 (e) + 청구항 7",
  },
];

const TOTAL_DURATION = STAGES.reduce((s, st) => s + st.duration, 0);

// ──────────────────────────────────────────────────────────────
// 예시 문제 (전기기사 EM — 환상 솔레노이드 자속)
// ──────────────────────────────────────────────────────────────
const PROBLEM = {
  question:
    "권수 N=200, 단면적 A=2cm², 평균 자로 길이 ℓ=10cm 인 환상 솔레노이드에 전류 I=2A 가 흐를 때 자속 Φ 의 값(Wb)은? (μ₀ = 4π×10⁻⁷)",
  // 의미 단위 분해 결과
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
  // 정답 = N·μ₀·I·A / ℓ = 200 × 4π×10⁻⁷ × 2 × 2×10⁻⁴ / 0.1 ≈ 2.011×10⁻⁵ Wb
  formula: "Φ = N·μ₀·I·A / ℓ",
};

// ──────────────────────────────────────────────────────────────
// 노드 좌표 (단계 2에서 그래프 그릴 때)
// ──────────────────────────────────────────────────────────────
const NODES = [
  { id: "Q", label: "Φ", type: "question", x: 380, y: 80, kind: "질문노드" },
  { id: "C1", label: "환상 솔레노이드", type: "concept", x: 130, y: 180, kind: "개념노드" },
  { id: "C2", label: "자속", type: "concept", x: 380, y: 180, kind: "개념노드" },
  { id: "F", label: "Φ=NμIA/ℓ", type: "formula", x: 630, y: 180, kind: "수식노드" },
  { id: "V1", label: "N=200", type: "value", x: 60, y: 290, kind: "값노드" },
  { id: "V2", label: "A=2cm²", type: "value", x: 200, y: 290, kind: "값노드" },
  { id: "V3", label: "ℓ=10cm", type: "value", x: 340, y: 290, kind: "값노드" },
  { id: "V4", label: "I=2A", type: "value", x: 480, y: 290, kind: "값노드" },
  // 선택지 노드
  { id: "O1", label: "①", type: "option", x: 110, y: 410, kind: "선택지노드" },
  { id: "O2", label: "②", type: "option", x: 310, y: 410, kind: "선택지노드", correct: true },
  { id: "O3", label: "③", type: "option", x: 510, y: 410, kind: "선택지노드" },
  { id: "O4", label: "④", type: "option", x: 680, y: 410, kind: "선택지노드" },
];

const EDGES = [
  // 질문 ↔ 개념·수식 (참조)
  { from: "Q", to: "C2", type: "참조" },
  { from: "Q", to: "F", type: "참조" },
  { from: "C1", to: "F", type: "포함" },
  { from: "C2", to: "F", type: "동등성" },
  // 값 → 수식 (계산)
  { from: "V1", to: "F", type: "계산" },
  { from: "V2", to: "F", type: "계산" },
  { from: "V3", to: "F", type: "계산" },
  { from: "V4", to: "F", type: "계산" },
  // 선택지 → 질문 (후보)
  { from: "O1", to: "Q", type: "참조" },
  { from: "O2", to: "Q", type: "참조" },
  { from: "O3", to: "Q", type: "참조" },
  { from: "O4", to: "Q", type: "참조" },
];

// 색상 토큰
const COLOR = {
  bg: "#0a0e1a",
  bgDeep: "#050811",
  panel: "#0f1726",
  border: "#1d2940",
  borderActive: "#f0a830",
  text: "#e8edf5",
  textDim: "#6b7895",
  amber: "#f0a830",
  amberDeep: "#c47a14",
  cyan: "#5ec8d8",
  cyanDeep: "#2a8a99",
  green: "#7dd87d",
  red: "#e87a7a",
  purple: "#a98be8",
};

const NODE_COLOR = {
  question: COLOR.amber,
  concept: COLOR.cyan,
  formula: COLOR.purple,
  value: COLOR.textDim,
  option: COLOR.green,
};

// ──────────────────────────────────────────────────────────────
// 메인 컴포넌트
// ──────────────────────────────────────────────────────────────
export default function PatentClaim1Demo() {
  const [elapsed, setElapsed] = useState(0); // ms within current cycle
  const [paused, setPaused] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const lastTickRef = useRef(performance.now());
  const rafRef = useRef(null);

  // 애니메이션 루프
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

  // 현재 단계 계산
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
        background: COLOR.bg,
        color: COLOR.text,
        fontFamily:
          "'Iowan Old Style', 'Palatino Linotype', 'Sitka Text', Georgia, serif",
        padding: "0",
        overflow: "hidden",
      }}
    >
      {/* 그리드 배경 (PCB 느낌) */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(94,200,216,0.08) 1px, transparent 0)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* 헤더 */}
      <Header cycleCount={cycleCount} paused={paused} setPaused={setPaused} />

      {/* 메인 그리드 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          gap: "0",
          position: "relative",
          zIndex: 1,
          minHeight: "calc(100vh - 90px)",
        }}
      >
        {/* 좌측: 청구항 텍스트 사이드바 */}
        <ClaimSidebar stageIdx={stageIdx} />

        {/* 우측: 단계별 시각화 */}
        <div
          style={{
            padding: "32px 48px",
            background: COLOR.bg,
            position: "relative",
          }}
        >
          {/* 단계 헤더 */}
          <StageHeader stage={stage} progress={stageProgress} />

          {/* 메인 시각화 영역 */}
          <div
            style={{
              marginTop: "28px",
              minHeight: "520px",
              background: COLOR.panel,
              border: `1px solid ${COLOR.border}`,
              borderRadius: "4px",
              padding: "32px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {stageIdx === 0 && <Stage1 progress={stageProgress} />}
            {stageIdx === 1 && <Stage2 progress={stageProgress} />}
            {stageIdx === 2 && <Stage3 progress={stageProgress} />}
            {stageIdx === 3 && <Stage4 progress={stageProgress} />}
            {stageIdx === 4 && <Stage5 progress={stageProgress} />}
          </div>

          {/* 단계 인디케이터 */}
          <StageIndicator stageIdx={stageIdx} elapsed={elapsed} />
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// 헤더
// ──────────────────────────────────────────────────────────────
function Header({ cycleCount, paused, setPaused }) {
  return (
    <div
      style={{
        background: COLOR.bgDeep,
        borderBottom: `1px solid ${COLOR.border}`,
        padding: "20px 48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative",
        zIndex: 2,
      }}
    >
      <div>
        <div
          style={{
            fontFamily:
              "'SF Mono', 'Cascadia Mono', Menlo, Monaco, monospace",
            fontSize: "11px",
            letterSpacing: "0.18em",
            color: COLOR.amber,
            marginBottom: "4px",
          }}
        >
          PATENT APPLICATION · 2025-12-22
        </div>
        <h1
          style={{
            fontSize: "22px",
            fontWeight: 500,
            margin: 0,
            letterSpacing: "0.01em",
            color: COLOR.text,
          }}
        >
          문장형 문제 기반 자동 풀이 및 맞춤형 문항 생성{" "}
          <span style={{ color: COLOR.textDim, fontWeight: 300 }}>
            — 청구항 1 (a)~(e) 시각화
          </span>
        </h1>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <div
          style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: "12px",
            color: COLOR.textDim,
          }}
        >
          cycle <span style={{ color: COLOR.amber }}>#{cycleCount + 1}</span>
        </div>
        <button
          onClick={() => setPaused(!paused)}
          style={{
            background: paused ? COLOR.amber : "transparent",
            color: paused ? COLOR.bgDeep : COLOR.text,
            border: `1px solid ${paused ? COLOR.amber : COLOR.border}`,
            padding: "8px 18px",
            fontFamily: "'SF Mono', monospace",
            fontSize: "11px",
            letterSpacing: "0.1em",
            cursor: "pointer",
            borderRadius: "2px",
            transition: "all 0.2s",
          }}
        >
          {paused ? "▶ RESUME" : "❚❚ PAUSE"}
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// 좌측 청구항 사이드바
// ──────────────────────────────────────────────────────────────
function ClaimSidebar({ stageIdx }) {
  return (
    <div
      style={{
        background: COLOR.bgDeep,
        borderRight: `1px solid ${COLOR.border}`,
        padding: "32px 24px",
        position: "relative",
      }}
    >
      <div
        style={{
          fontFamily: "'SF Mono', monospace",
          fontSize: "10px",
          letterSpacing: "0.2em",
          color: COLOR.textDim,
          marginBottom: "20px",
        }}
      >
        【청구항 1】
      </div>
      <div style={{ fontSize: "13px", lineHeight: "1.8", color: COLOR.textDim }}>
        문제 관리 서버에 의해 수행되는, 학습 또는 평가를 목적으로 제공되는 문장형
        문제를 자동으로 풀이하고, 상기 문장형 문제를 기반으로 학습자에게 맞춤형
        문항을 생성해주기 위한 방법으로서,
      </div>

      <div style={{ marginTop: "24px" }}>
        {STAGES.map((s, i) => (
          <div
            key={i}
            style={{
              padding: "14px 16px",
              marginBottom: "10px",
              background: i === stageIdx ? "rgba(240,168,48,0.08)" : "transparent",
              borderLeft: `2px solid ${
                i === stageIdx ? COLOR.amber : COLOR.border
              }`,
              transition: "all 0.4s",
            }}
          >
            <div
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: "10px",
                color: i === stageIdx ? COLOR.amber : COLOR.textDim,
                marginBottom: "6px",
                letterSpacing: "0.1em",
              }}
            >
              ({String.fromCharCode(97 + i)}) {s.label_en}
            </div>
            <div
              style={{
                fontSize: "12px",
                lineHeight: "1.65",
                color: i === stageIdx ? COLOR.text : COLOR.textDim,
              }}
            >
              {s.claim_text}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: "28px",
          padding: "16px",
          background: COLOR.panel,
          borderRadius: "2px",
          border: `1px solid ${COLOR.border}`,
        }}
      >
        <div
          style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: "10px",
            color: COLOR.amber,
            letterSpacing: "0.15em",
            marginBottom: "8px",
          }}
        >
          ESSENTIAL BASIS
        </div>
        <div style={{ fontSize: "12px", lineHeight: "1.6", color: COLOR.text }}>
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
          alignItems: "baseline",
          gap: "16px",
          marginBottom: "8px",
        }}
      >
        <div
          style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: "48px",
            fontWeight: 200,
            color: COLOR.amber,
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          0{stage.no}
        </div>
        <div>
          <div
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: "10px",
              letterSpacing: "0.2em",
              color: COLOR.textDim,
            }}
          >
            {stage.claim_no} · STEP {stage.no} / 5
          </div>
          <div style={{ fontSize: "26px", fontWeight: 500, marginTop: "4px" }}>
            {stage.label_ko}
          </div>
          <div
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: "12px",
              color: COLOR.cyan,
              marginTop: "2px",
              letterSpacing: "0.05em",
            }}
          >
            {stage.label_en}
          </div>
        </div>
      </div>
      {/* 진행 막대 */}
      <div
        style={{
          height: "2px",
          background: COLOR.border,
          marginTop: "16px",
          position: "relative",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress * 100}%`,
            background: COLOR.amber,
            transition: "width 0.1s linear",
          }}
        />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// 단계 인디케이터 (하단)
// ──────────────────────────────────────────────────────────────
function StageIndicator({ stageIdx, elapsed }) {
  return (
    <div
      style={{
        marginTop: "24px",
        display: "flex",
        gap: "4px",
        alignItems: "center",
        fontFamily: "'SF Mono', monospace",
        fontSize: "11px",
        color: COLOR.textDim,
      }}
    >
      {STAGES.map((s, i) => (
        <div
          key={i}
          style={{
            flex: s.duration,
            height: "32px",
            background: i < stageIdx ? COLOR.cyanDeep : i === stageIdx ? COLOR.amberDeep : COLOR.panel,
            border: `1px solid ${i === stageIdx ? COLOR.amber : COLOR.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: i === stageIdx ? COLOR.text : i < stageIdx ? COLOR.text : COLOR.textDim,
            fontSize: "10px",
            letterSpacing: "0.1em",
            transition: "all 0.4s",
          }}
        >
          ({String.fromCharCode(97 + i)}) {s.label_ko}
        </div>
      ))}
      <div style={{ marginLeft: "16px", color: COLOR.textDim }}>
        {(elapsed / 1000).toFixed(1)}s / {(TOTAL_DURATION / 1000).toFixed(0)}s
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 단계 1: 의미 단위 분해
// ══════════════════════════════════════════════════════════════
function Stage1({ progress }) {
  // 0 ~ 0.4: 원본 문제 표시
  // 0.4 ~ 1.0: 의미 단위로 분해되어 흩어짐
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
        {/* 좌측: 원본 문제 */}
        <div>
          <SectionLabel>INPUT — 문장형 문제</SectionLabel>
          <div
            style={{
              padding: "20px 24px",
              background: COLOR.bgDeep,
              border: `1px solid ${COLOR.border}`,
              borderRadius: "2px",
              fontSize: "15px",
              lineHeight: 1.8,
              color: COLOR.text,
              minHeight: "180px",
            }}
          >
            {PROBLEM.question}
          </div>
          <div style={{ marginTop: "16px" }}>
            <SectionLabel>선택지</SectionLabel>
            <div style={{ display: "grid", gap: "6px" }}>
              {PROBLEM.choices.map((c) => (
                <div
                  key={c.no}
                  style={{
                    fontFamily: "'SF Mono', monospace",
                    fontSize: "13px",
                    padding: "6px 12px",
                    color: COLOR.textDim,
                  }}
                >
                  ({c.no}) {c.value}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 우측: 분해된 의미 단위들 */}
        <div>
          <SectionLabel>OUTPUT — 의미 단위</SectionLabel>
          <div
            style={{
              minHeight: "360px",
              position: "relative",
              padding: "16px",
              background: COLOR.bgDeep,
              border: `1px dashed ${COLOR.border}`,
              borderRadius: "2px",
            }}
          >
            {showUnits && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {PROBLEM.question_units.map((u, i) => {
                  const delay = (i / PROBLEM.question_units.length) * 0.7;
                  const opacity = Math.max(
                    0,
                    Math.min(1, (unitProgress - delay) * 4)
                  );
                  const translateY = Math.max(0, 20 - opacity * 20);
                  return (
                    <div
                      key={i}
                      style={{
                        opacity,
                        transform: `translateY(${translateY}px)`,
                        padding: "8px 14px",
                        background:
                          u.type === "value"
                            ? "rgba(94,200,216,0.1)"
                            : "rgba(240,168,48,0.1)",
                        border: `1px solid ${
                          u.type === "value" ? COLOR.cyan : COLOR.amber
                        }`,
                        borderRadius: "2px",
                        fontFamily: "'SF Mono', monospace",
                        fontSize: "12px",
                        color: u.type === "value" ? COLOR.cyan : COLOR.amber,
                      }}
                    >
                      <div
                        style={{
                          fontSize: "9px",
                          letterSpacing: "0.15em",
                          color: COLOR.textDim,
                          marginBottom: "2px",
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
                  fontFamily: "'SF Mono', monospace",
                  fontSize: "12px",
                  color: COLOR.textDim,
                  letterSpacing: "0.1em",
                }}
              >
                형태소 · 토큰 · 개체명 · 의미역 분석 중...
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNote>
        ⓘ 청구항 2: 형태소 분석, 토큰화, 개체명 인식, 의미역 분석을 적용하여 질문
        요소(개념·단위)와 선택지 요소(수치·단위)를 분리 추출
      </BottomNote>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 단계 2: 노드/엣지 그래프 변환
// ══════════════════════════════════════════════════════════════
function Stage2({ progress }) {
  // 노드 → 엣지 → 라벨 순으로 그려짐
  const nodeProgress = Math.min(1, progress * 2.5);
  const edgeProgress = Math.max(0, Math.min(1, (progress - 0.4) * 2.2));

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", gap: "24px" }}>
        <div>
          <SectionLabel>OUTPUT — 문항 구조 그래프</SectionLabel>
          <div
            style={{
              background: COLOR.bgDeep,
              border: `1px solid ${COLOR.border}`,
              borderRadius: "2px",
              padding: "16px",
            }}
          >
            <svg viewBox="0 0 760 470" style={{ width: "100%", display: "block" }}>
              {/* 엣지 */}
              {EDGES.map((e, i) => {
                const from = NODES.find((n) => n.id === e.from);
                const to = NODES.find((n) => n.id === e.to);
                const visible = (i / EDGES.length) < edgeProgress;
                if (!visible) return null;
                const colors = {
                  참조: COLOR.cyan,
                  포함: COLOR.purple,
                  계산: COLOR.amber,
                  동등성: COLOR.green,
                };
                return (
                  <line
                    key={i}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={colors[e.type] || COLOR.textDim}
                    strokeWidth="1.5"
                    strokeOpacity="0.55"
                    strokeDasharray={e.type === "참조" ? "4 3" : "0"}
                  />
                );
              })}
              {/* 노드 */}
              {NODES.map((n, i) => {
                const t = i / NODES.length;
                const opacity = Math.max(0, Math.min(1, (nodeProgress - t) * 5));
                if (opacity <= 0) return null;
                const r = n.type === "question" ? 26 : n.type === "option" ? 20 : 22;
                const color = NODE_COLOR[n.type];
                return (
                  <g key={n.id} opacity={opacity}>
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={r}
                      fill={COLOR.bgDeep}
                      stroke={color}
                      strokeWidth="1.5"
                    />
                    <text
                      x={n.x}
                      y={n.y + 4}
                      textAnchor="middle"
                      fontSize={n.type === "value" || n.type === "formula" ? "10" : "11"}
                      fill={color}
                      fontFamily="SF Mono, monospace"
                    >
                      {n.label}
                    </text>
                    <text
                      x={n.x}
                      y={n.y + r + 12}
                      textAnchor="middle"
                      fontSize="8"
                      fill={COLOR.textDim}
                      letterSpacing="0.1em"
                    >
                      {n.kind}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* 우측 범례 */}
        <div>
          <SectionLabel>NODE TYPES (청구항 3)</SectionLabel>
          {[
            ["질문노드", COLOR.amber],
            ["개념노드", COLOR.cyan],
            ["수식노드", COLOR.purple],
            ["값노드", COLOR.textDim],
            ["선택지노드", COLOR.green],
          ].map(([label, color]) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "8px",
                fontSize: "12px",
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  border: `2px solid ${color}`,
                }}
              />
              <span style={{ color: COLOR.text }}>{label}</span>
            </div>
          ))}

          <div style={{ marginTop: "20px" }}>
            <SectionLabel>EDGE TYPES</SectionLabel>
            {[
              ["참조", COLOR.cyan, "dashed"],
              ["포함", COLOR.purple, "solid"],
              ["계산", COLOR.amber, "solid"],
              ["동등성", COLOR.green, "solid"],
            ].map(([label, color, style]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "6px",
                  fontSize: "12px",
                }}
              >
                <svg width="20" height="6">
                  <line
                    x1="0"
                    y1="3"
                    x2="20"
                    y2="3"
                    stroke={color}
                    strokeWidth="1.5"
                    strokeDasharray={style === "dashed" ? "3 2" : "0"}
                  />
                </svg>
                <span style={{ color: COLOR.text }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNote>
        ⓘ 청구항 3: 노드는 질문/조건/선택지/개념/수식/값 노드 중 하나, 엣지는
        의존·참조·포함·계산·동등성 관계 중 하나. <strong style={{ color: COLOR.amber }}>선택지가 그래프 정식 멤버</strong>인 점이
        US 10,108,604 와의 핵심 차별점.
      </BottomNote>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 단계 3: 신경망 임베딩
// ══════════════════════════════════════════════════════════════
function Stage3({ progress }) {
  // 노드 → 임베딩 벡터로 변환되는 모습
  const VECTOR_DIM = 16;
  // 시드 기반 의사난수 (안정적인 시각화)
  const seedVec = (seed, dim) =>
    Array.from({ length: dim }, (_, i) => {
      const x = Math.sin(seed * 13 + i * 7) * 10000;
      return x - Math.floor(x);
    });

  const targets = [
    { label: "질문 임베딩 (Φ)", color: COLOR.amber, vec: seedVec(1, VECTOR_DIM) },
    { label: "선택지 ① 임베딩", color: COLOR.green, vec: seedVec(2, VECTOR_DIM) },
    { label: "선택지 ② 임베딩", color: COLOR.green, vec: seedVec(3, VECTOR_DIM) },
    { label: "선택지 ③ 임베딩", color: COLOR.green, vec: seedVec(4, VECTOR_DIM) },
    { label: "선택지 ④ 임베딩", color: COLOR.green, vec: seedVec(5, VECTOR_DIM) },
  ];

  return (
    <div>
      <SectionLabel>GraphSAGE / GAT 적용 — 노드 → 고차원 벡터</SectionLabel>

      <div
        style={{
          padding: "20px 24px",
          background: COLOR.bgDeep,
          border: `1px solid ${COLOR.border}`,
          borderRadius: "2px",
          marginTop: "12px",
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
                gridTemplateColumns: "180px 1fr",
                gap: "20px",
                alignItems: "center",
                padding: "10px 0",
                opacity: itemProgress,
                transform: `translateX(${(1 - itemProgress) * -20}px)`,
                transition: "all 0.3s",
              }}
            >
              <div
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: "12px",
                  color: t.color,
                }}
              >
                {t.label}
              </div>
              <div style={{ display: "flex", gap: "3px" }}>
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
                        height: "32px",
                        background: t.color,
                        opacity: v * 0.9 * cellOpacity,
                        borderRadius: "1px",
                      }}
                      title={v.toFixed(3)}
                    />
                  );
                })}
                <div
                  style={{
                    fontFamily: "'SF Mono', monospace",
                    fontSize: "10px",
                    color: COLOR.textDim,
                    marginLeft: "12px",
                    alignSelf: "center",
                  }}
                >
                  ℝ^{VECTOR_DIM}...{VECTOR_DIM > 16 ? "" : "768"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <BottomNote>
        ⓘ 청구항 5: 그래프 합성곱 신경망(GCN), 그래프 어텐션 네트워크(GAT),
        GraphSAGE, Node2Vec, 자기지도 대조학습 중 적어도 하나를 적용. 질문 임베딩
        + 4개 선택지 임베딩 = 총 5개 벡터 생성.
      </BottomNote>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 단계 4: 유사도 연산
// ══════════════════════════════════════════════════════════════
function Stage4({ progress }) {
  // 4개 선택지에 대한 유사도 점수 (실제 정답 ②가 가장 높게)
  const scores = [
    { no: 1, value: 0.412 },
    { no: 2, value: 0.937, correct: true },
    { no: 3, value: 0.521 },
    { no: 4, value: 0.298 },
  ];

  return (
    <div>
      <SectionLabel>코사인 유사도 cos(질문, 선택지ᵢ) → 점수 벡터 산출</SectionLabel>

      <div
        style={{
          marginTop: "12px",
          padding: "24px",
          background: COLOR.bgDeep,
          border: `1px solid ${COLOR.border}`,
          borderRadius: "2px",
        }}
      >
        {/* 공식 표시 */}
        <div
          style={{
            fontFamily: "'SF Mono', monospace",
            fontSize: "13px",
            color: COLOR.textDim,
            textAlign: "center",
            padding: "8px 0 24px",
            letterSpacing: "0.05em",
          }}
        >
          score(Q, Oᵢ) = cos(e_Q, e_Oᵢ) ·{" "}
          <span style={{ color: COLOR.cyan }}>α_난이도</span> ·{" "}
          <span style={{ color: COLOR.cyan }}>β_빈도</span>
        </div>

        {/* 막대 그래프 */}
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
                  fontFamily: "'SF Mono', monospace",
                  fontSize: "16px",
                  color: s.correct ? COLOR.amber : COLOR.text,
                  fontWeight: s.correct ? 600 : 400,
                }}
              >
                ({s.no})
              </div>
              <div
                style={{
                  height: "28px",
                  background: COLOR.panel,
                  position: "relative",
                  border: `1px solid ${COLOR.border}`,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${barWidth}%`,
                    background: s.correct
                      ? `linear-gradient(90deg, ${COLOR.amberDeep}, ${COLOR.amber})`
                      : `linear-gradient(90deg, ${COLOR.cyanDeep}, ${COLOR.cyan})`,
                    transition: "width 0.3s ease-out",
                  }}
                />
              </div>
              <div
                style={{
                  fontFamily: "'SF Mono', monospace",
                  fontSize: "14px",
                  color: s.correct ? COLOR.amber : COLOR.text,
                  textAlign: "right",
                  fontWeight: s.correct ? 600 : 400,
                }}
              >
                {(s.value * itemProgress).toFixed(3)}
              </div>
            </div>
          );
        })}

        {/* 점수 벡터 표기 */}
        <div
          style={{
            marginTop: "20px",
            padding: "12px 16px",
            background: COLOR.panel,
            border: `1px solid ${COLOR.border}`,
            borderRadius: "2px",
            fontFamily: "'SF Mono', monospace",
            fontSize: "13px",
            color: COLOR.cyan,
            opacity: progress,
          }}
        >
          score_vec = [
          {scores
            .map((s) => (s.value * Math.min(1, progress * 1.5)).toFixed(3))
            .join(", ")}
          ]
        </div>
      </div>

      <BottomNote>
        ⓘ 청구항 6: 코사인 유사도 또는 유클리드 거리, 난이도 보정계수 + 문항 빈도
        보정계수 적용. <strong style={{ color: COLOR.amber }}>1:N 매칭 (질문 1개 ↔ 선택지 N개)</strong> 구조는
        US 10,108,604 (1:N 출력 = 새 문제 생성) 과 정반대 방향.
      </BottomNote>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 단계 5: 정답 결정
// ══════════════════════════════════════════════════════════════
function Stage5({ progress }) {
  // 단계: argmax 강조 → 정답 ② 도출
  const showResult = progress > 0.4;
  const resultPulse = showResult
    ? 0.5 + 0.5 * Math.sin((progress - 0.4) * 12)
    : 0;

  return (
    <div>
      <SectionLabel>argmax(score_vec) — 점수 벡터 최대값 선택지를 정답으로 결정</SectionLabel>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", marginTop: "16px" }}>
        {/* 좌측: 점수 벡터 + argmax */}
        <div
          style={{
            padding: "24px",
            background: COLOR.bgDeep,
            border: `1px solid ${COLOR.border}`,
            borderRadius: "2px",
          }}
        >
          <div
            style={{
              fontFamily: "'SF Mono', monospace",
              fontSize: "11px",
              color: COLOR.textDim,
              marginBottom: "12px",
              letterSpacing: "0.1em",
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
                padding: "8px 12px",
                marginBottom: "6px",
                background: s.correct
                  ? `rgba(240,168,48,${0.1 + resultPulse * 0.2})`
                  : COLOR.panel,
                border: `1px solid ${s.correct ? COLOR.amber : COLOR.border}`,
                fontFamily: "'SF Mono', monospace",
                fontSize: "14px",
                color: s.correct ? COLOR.amber : COLOR.text,
                transition: "background 0.2s",
              }}
            >
              <span>
                ({s.no}) {PROBLEM.choices.find((c) => c.no === s.no).value}
              </span>
              <span>{s.v.toFixed(3)}</span>
            </div>
          ))}

          <div
            style={{
              marginTop: "20px",
              padding: "10px 14px",
              background: COLOR.panel,
              borderLeft: `3px solid ${COLOR.amber}`,
              fontFamily: "'SF Mono', monospace",
              fontSize: "12px",
              color: COLOR.amber,
            }}
          >
            argmax → index 2 (점수 0.937 / 임계값 차이 0.416 → 신뢰도 HIGH)
          </div>
        </div>

        {/* 우측: 최종 정답 */}
        <div
          style={{
            padding: "24px",
            background: COLOR.bgDeep,
            border: `1px solid ${COLOR.amber}`,
            borderRadius: "2px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* 장식 — 회로 grid */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(rgba(240,168,48,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(240,168,48,0.05) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative" }}>
            <div
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: "11px",
                color: COLOR.amber,
                letterSpacing: "0.2em",
                marginBottom: "16px",
              }}
            >
              OUTPUT — 결정된 정답
            </div>
            <div
              style={{
                fontSize: "72px",
                fontWeight: 200,
                color: COLOR.amber,
                lineHeight: 1,
                marginBottom: "12px",
                opacity: showResult ? 1 : 0.2,
                transform: `scale(${showResult ? 1 : 0.8})`,
                transition: "all 0.4s",
              }}
            >
              ②
            </div>
            <div
              style={{
                fontFamily: "'SF Mono', monospace",
                fontSize: "20px",
                color: COLOR.text,
                opacity: showResult ? 1 : 0.3,
                transition: "opacity 0.4s 0.2s",
              }}
            >
              Φ ≈ 2.011 × 10⁻⁵ Wb
            </div>

            <div
              style={{
                marginTop: "24px",
                padding: "12px 14px",
                background: "rgba(125,216,125,0.08)",
                borderLeft: `3px solid ${COLOR.green}`,
                fontSize: "12px",
                color: COLOR.green,
                opacity: showResult ? 1 : 0,
                transition: "opacity 0.4s 0.4s",
                lineHeight: 1.6,
              }}
            >
              검증: Φ = N·μ₀·I·A / ℓ
              <br />= 200 · 4π×10⁻⁷ · 2 · 2×10⁻⁴ / 0.1
              <br />= 2.011 × 10⁻⁵ Wb ✓
            </div>
          </div>
        </div>
      </div>

      <BottomNote>
        ⓘ 청구항 7: 점수 벡터의 최대값 또는 최소값 기준으로 정답 결정. 동점 발생
        시 난이도 기준 또는 무작위화 규칙 적용. <strong style={{ color: COLOR.amber }}>이미 제공된 N개 선택지에서
        정답 1개를 선택</strong>하는 구조 — 새 문제 생성(US 10,108,604)이 아닌 정답 결정.
      </BottomNote>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// 공통 컴포넌트
// ──────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontFamily: "'SF Mono', 'Cascadia Mono', Menlo, monospace",
        fontSize: "10px",
        letterSpacing: "0.2em",
        color: COLOR.textDim,
        marginBottom: "10px",
      }}
    >
      {children}
    </div>
  );
}

function BottomNote({ children }) {
  return (
    <div
      style={{
        marginTop: "20px",
        padding: "12px 16px",
        background: "rgba(94,200,216,0.04)",
        borderLeft: `2px solid ${COLOR.cyan}`,
        fontSize: "12px",
        lineHeight: 1.7,
        color: COLOR.textDim,
      }}
    >
      {children}
    </div>
  );
}
