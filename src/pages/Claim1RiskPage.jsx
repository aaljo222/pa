import { useEffect, useRef, useState } from "react";
import { COLORS, FONT, SHADOW } from "../theme.js";

/**
 * Claim1RiskPage — 청구항 1 차별화 데모 (애니메이션 강화)
 *
 * 핵심 메시지:
 *   "선행기술 A(KG) + B(임베딩) = 진보성 위협처럼 보이지만,
 *    우리 청구항은 '객관식 입력 한정'으로 5단계 전체를 재정의한다."
 *
 * 시퀀스:
 *   Phase 0: 두 선행기술 카드 좌우 대기
 *   Phase 1: 좌우에서 중앙으로 충돌 (위협 시각화 + 폭발)
 *   Phase 2: "OBJECTIVE-CHOICE" 도장이 위에서 강하게 떨어짐 (충격파)
 *   Phase 3: 도장에서 5개 라인이 뻗어 5단계 카드로 점령
 *   Phase 4: 카드 모두 보라색으로 변하며 결론 박스 활성화
 */

export default function Claim1RiskPage() {
  const [phase, setPhase] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!autoplay) return;
    const schedule = [
      { delay: 600, next: 1 },
      { delay: 1800, next: 2 },
      { delay: 1400, next: 3 },
      { delay: 2400, next: 4 },
      { delay: 3500, next: 0 },
    ];
    const step = schedule[phase];
    if (step) {
      timerRef.current = setTimeout(() => setPhase(step.next), step.delay);
    }
    return () => clearTimeout(timerRef.current);
  }, [phase, autoplay]);

  const restart = () => {
    clearTimeout(timerRef.current);
    setPhase(0);
    setAutoplay(true);
  };

  return (
    <div style={{ padding: "40px 32px", maxWidth: 1280, margin: "0 auto" }}>
      <style>{KEYFRAMES}</style>

      <Header />

      {/* 핵심 메시지 띠 */}
      <div
        style={{
          padding: "16px 24px",
          background: "linear-gradient(90deg, #1e293b, #4c1d95)",
          color: COLORS.white,
          borderRadius: 14,
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 16,
          boxShadow: SHADOW.md,
        }}
      >
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 10,
            padding: "4px 10px",
            background: COLORS.orange,
            color: COLORS.dark,
            borderRadius: 999,
            fontWeight: 800,
            letterSpacing: "0.18em",
            flexShrink: 0,
          }}
        >
          THE THESIS
        </div>
        <div style={{ fontSize: 15, lineHeight: 1.5 }}>
          선행기술 두 개의 결합? 인정. 그러나 본 청구항의{" "}
          <span
            style={{
              background: `linear-gradient(90deg, ${COLORS.orange}, ${COLORS.pink})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: 18,
              fontWeight: 800,
            }}
          >
            "객관식 입력 한정"
          </span>
          은 단순 한정이 아니라 5단계 전체의 의미를 재정의하는 차별화
          요소입니다.
        </div>
      </div>

      <ControlBar
        phase={phase}
        onRestart={restart}
        setPhase={setPhase}
        setAutoplay={setAutoplay}
      />

      <Stage phase={phase} />

      <Conclusion phase={phase} />

      <div
        style={{
          marginTop: 28,
          paddingTop: 18,
          borderTop: `1px solid ${COLORS.textDim}30`,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: FONT.mono,
          fontSize: 10,
          color: COLORS.textDim,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        <span>홍성훈 변리사 검토용 · 2026.05.07</span>
        <span>elecai.co.kr / Demo Build</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
function Header() {
  return (
    <div style={{ marginBottom: 28 }}>
      <div
        style={{
          display: "inline-block",
          padding: "5px 14px",
          background: COLORS.dark,
          color: COLORS.white,
          fontFamily: FONT.mono,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.18em",
          borderRadius: 999,
          marginBottom: 14,
        }}
      >
        ◆ ATTORNEY REVIEW · INTERNAL
      </div>
      <h1
        style={{
          fontSize: 42,
          fontWeight: 800,
          margin: 0,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          background: `linear-gradient(135deg, ${COLORS.dark}, ${COLORS.purple} 50%, ${COLORS.pink})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        청구항 1의 차별화 포인트
        <br />— "객관식 입력 한정"의 의미
      </h1>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
function ControlBar({ phase, onRestart, setPhase, setAutoplay }) {
  const phases = [
    "대기",
    "선행기술 충돌",
    "객관식 도장",
    "차별화 확산",
    "결론",
  ];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 16px",
        background: COLORS.glass,
        backdropFilter: "blur(20px)",
        borderRadius: 12,
        marginBottom: 20,
        boxShadow: SHADOW.sm,
      }}
    >
      <button
        onClick={onRestart}
        style={{
          padding: "8px 16px",
          background: COLORS.dark,
          color: COLORS.white,
          border: "none",
          borderRadius: 999,
          fontFamily: FONT.mono,
          fontSize: 11,
          fontWeight: 700,
          cursor: "pointer",
          letterSpacing: "0.1em",
          flexShrink: 0,
        }}
      >
        ▶ REPLAY
      </button>
      <div style={{ display: "flex", gap: 6, flex: 1 }}>
        {phases.map((label, i) => (
          <button
            key={i}
            onClick={() => {
              setAutoplay(false);
              setPhase(i);
            }}
            style={{
              flex: 1,
              padding: "8px 10px",
              background: phase === i ? COLORS.purple : COLORS.white,
              color: phase === i ? COLORS.white : COLORS.textDim,
              border: "none",
              borderRadius: 8,
              fontFamily: FONT.mono,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.1em",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {String(i).padStart(2, "0")} · {label.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
function Stage({ phase }) {
  return (
    <div
      style={{
        position: "relative",
        height: 620,
        background:
          "radial-gradient(circle at 50% 40%, #1e1b4b 0%, #0f172a 70%)",
        borderRadius: 24,
        overflow: "hidden",
        boxShadow: SHADOW.md,
        marginBottom: 24,
      }}
    >
      {/* 배경 그리드 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          opacity: phase >= 1 ? 1 : 0.3,
          transition: "opacity 0.8s",
        }}
      />

      {/* Phase 1 충돌 시 화면 플래시 */}
      {phase === 1 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 50% 50%, ${COLORS.pink}40, transparent 60%)`,
            animation: "flash 0.8s ease-out",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Phase 라벨 */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          fontFamily: FONT.mono,
          fontSize: 11,
          color: "rgba(255,255,255,0.5)",
          letterSpacing: "0.2em",
          fontWeight: 700,
        }}
      >
        PHASE {String(phase).padStart(2, "0")} ◆{" "}
        {
          [
            "IDLE",
            "PRIOR ART COLLISION",
            "DIFFERENTIATOR DROP",
            "REDEFINE PROPAGATION",
            "CONCLUSION",
          ][phase]
        }
      </div>

      {/* 좌측 선행기술 A */}
      <PriorArtToken
        side="left"
        phase={phase}
        title="Prior Art A"
        subtitle="Knowledge Graph Extraction"
        examples={["OpenIE (2015)", "AMR Parsing (2013)", "Text-to-Graph QA"]}
        color={COLORS.pink}
      />

      {/* 우측 선행기술 B */}
      <PriorArtToken
        side="right"
        phase={phase}
        title="Prior Art B"
        subtitle="Embedding + Similarity QA"
        examples={[
          "Word2Vec (2013)",
          "Sentence-BERT (2019)",
          "Cosine Similarity",
        ]}
        color={COLORS.cyan}
      />

      {/* 중앙 폭발 */}
      {phase === 1 && (
        <div
          style={{
            position: "absolute",
            top: "38%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${COLORS.orange}80, transparent 70%)`,
            animation: "explode 1s ease-out",
          }}
        />
      )}

      {/* OBJECTIVE-CHOICE 도장 */}
      {phase >= 2 && <ObjectiveChoiceStamp phase={phase} />}

      {/* 차별화 라인 */}
      {phase >= 3 && <DifferentiatorRays phase={phase} />}

      {/* 5단계 카드 */}
      <FiveStepBar phase={phase} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
function PriorArtToken({ side, phase, title, subtitle, examples, color }) {
  // phase 0: 좌우 대기
  // phase 1: 중앙으로 충돌하며 사라짐
  // phase >= 2: 멀리 흐리게

  const baseLeft = side === "left" ? "5%" : "auto";
  const baseRight = side === "right" ? "5%" : "auto";

  let transform = "translateY(-50%)";
  let opacity = 1;

  if (phase === 1) {
    transform = `${side === "left" ? "translateX(280px)" : "translateX(-280px)"} translateY(-50%) scale(0.4) rotate(${
      side === "left" ? "12deg" : "-12deg"
    })`;
    opacity = 0;
  } else if (phase >= 2) {
    transform = `${side === "left" ? "translateX(-30px)" : "translateX(30px)"} translateY(-50%) scale(0.75)`;
    opacity = 0.22;
  }

  return (
    <div
      style={{
        position: "absolute",
        top: "32%",
        left: baseLeft,
        right: baseRight,
        width: 230,
        padding: 18,
        background: `linear-gradient(135deg, ${color}30, ${color}10)`,
        border: `1.5px solid ${color}80`,
        borderRadius: 16,
        backdropFilter: "blur(12px)",
        transform,
        opacity,
        transition:
          phase === 1
            ? "all 0.8s cubic-bezier(0.7, 0, 0.84, 0)"
            : "all 0.6s ease-out",
        boxShadow: `0 0 40px ${color}30`,
      }}
    >
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 9,
          color,
          letterSpacing: "0.2em",
          fontWeight: 800,
          marginBottom: 6,
        }}
      >
        ▸ {title.toUpperCase()}
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 800,
          color: COLORS.white,
          marginBottom: 10,
        }}
      >
        {subtitle}
      </div>
      {examples.map((ex, i) => (
        <div
          key={i}
          style={{
            fontFamily: FONT.mono,
            fontSize: 10,
            color: "rgba(255,255,255,0.7)",
            marginBottom: 3,
          }}
        >
          · {ex}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
function ObjectiveChoiceStamp({ phase }) {
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: "38%",
          left: "50%",
          padding: "26px 44px",
          background: `linear-gradient(135deg, ${COLORS.orange}, ${COLORS.pink})`,
          border: `4px solid ${COLORS.white}`,
          borderRadius: 12,
          boxShadow: `0 20px 60px ${COLORS.orange}80, inset 0 0 20px rgba(255,255,255,0.3)`,
          animation:
            phase === 2
              ? "stamp 0.9s cubic-bezier(0.34, 1.56, 0.64, 1)"
              : "none",
          transform: "translate(-50%, -50%)",
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 11,
            color: "rgba(255,255,255,0.9)",
            letterSpacing: "0.25em",
            fontWeight: 700,
            marginBottom: 4,
            textAlign: "center",
          }}
        >
          OUR DIFFERENTIATOR
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 900,
            color: COLORS.white,
            letterSpacing: "0.05em",
            textShadow: "0 2px 8px rgba(0,0,0,0.3)",
            textAlign: "center",
          }}
        >
          OBJECTIVE-CHOICE
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "rgba(255,255,255,0.95)",
            textAlign: "center",
            marginTop: 4,
          }}
        >
          객관식 입력 한정
        </div>
      </div>

      {/* 충격파 — 도장이 떨어질 때 */}
      {phase === 2 && (
        <>
          <div
            style={{
              position: "absolute",
              top: "38%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 100,
              height: 100,
              border: `3px solid ${COLORS.orange}`,
              borderRadius: "50%",
              animation: "shockwave 1s ease-out",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "38%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 100,
              height: 100,
              border: `2px solid ${COLORS.pink}`,
              borderRadius: "50%",
              animation: "shockwave 1.2s ease-out 0.15s",
              pointerEvents: "none",
            }}
          />
        </>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════ */
function DifferentiatorRays({ phase }) {
  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="rayGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={COLORS.orange} stopOpacity="1" />
          <stop offset="100%" stopColor={COLORS.purple} stopOpacity="0.4" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3, 4].map((i) => {
        // 5단계 카드 중심 X 좌표 (Stage padding 고려)
        const xPct = 12 + i * 18.5;
        return (
          <line
            key={i}
            x1="50%"
            y1="38%"
            x2={`${xPct}%`}
            y2="78%"
            stroke="url(#rayGrad)"
            strokeWidth="2.5"
            strokeDasharray="600"
            strokeDashoffset={phase >= 3 ? 0 : 600}
            style={{
              transition: `stroke-dashoffset 0.6s ease-out ${i * 0.12}s`,
            }}
          />
        );
      })}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════ */
const STEPS = [
  { id: 1, label: "의미 분해", was: "토큰화", now: "선택지 단위 분해" },
  { id: 2, label: "그래프 변환", was: "텍스트→KG", now: "질문↔선택지 그래프" },
  { id: 3, label: "임베딩", was: "Word2Vec", now: "선택지 의존 임베딩" },
  { id: 4, label: "유사도 연산", was: "Cosine 거리", now: "선택지 점수 벡터" },
  { id: 5, label: "정답 결정", was: "argmax", now: "정답 일관성 검증" },
];

function FiveStepBar({ phase }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 30,
        left: 30,
        right: 30,
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 12,
      }}
    >
      {STEPS.map((step, i) => {
        const captured = phase >= 3;
        const fullyOurs = phase >= 4;
        return (
          <div
            key={step.id}
            style={{
              padding: "14px 12px",
              background: fullyOurs
                ? `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.pink})`
                : captured
                  ? `linear-gradient(135deg, ${COLORS.orange}40, ${COLORS.pink}40)`
                  : "rgba(255,255,255,0.08)",
              border: captured
                ? `2px solid ${COLORS.orange}`
                : "1px solid rgba(255,255,255,0.2)",
              borderRadius: 12,
              textAlign: "center",
              transition: `all 0.6s ease-out ${i * 0.12}s`,
              transform: captured
                ? "translateY(-4px) scale(1.03)"
                : "translateY(0) scale(1)",
              boxShadow: captured ? `0 8px 24px ${COLORS.orange}40` : "none",
            }}
          >
            <div
              style={{
                fontFamily: FONT.mono,
                fontSize: 9,
                color: captured ? COLORS.white : "rgba(255,255,255,0.5)",
                letterSpacing: "0.15em",
                fontWeight: 700,
                marginBottom: 4,
              }}
            >
              STEP {String(step.id).padStart(2, "0")}
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: COLORS.white,
                marginBottom: 6,
              }}
            >
              {step.label}
            </div>
            <div
              style={{
                fontSize: 10,
                color: captured
                  ? "rgba(255,255,255,0.95)"
                  : "rgba(255,255,255,0.5)",
                fontStyle: "italic",
                minHeight: 14,
                transition: "all 0.4s",
              }}
            >
              {captured ? `→ ${step.now}` : step.was}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
function Conclusion({ phase }) {
  const visible = phase >= 4;
  return (
    <div
      style={{
        padding: 28,
        background: visible
          ? `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.pink})`
          : COLORS.glass,
        backdropFilter: "blur(20px)",
        borderRadius: 20,
        boxShadow: visible ? SHADOW.glow(COLORS.purple) : SHADOW.sm,
        transition: "all 0.8s",
        color: visible ? COLORS.white : COLORS.text,
        opacity: visible ? 1 : 0.55,
      }}
    >
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 11,
          letterSpacing: "0.2em",
          fontWeight: 800,
          marginBottom: 12,
          color: visible ? "rgba(255,255,255,0.85)" : COLORS.textDim,
        }}
      >
        ▶ KEY ARGUMENT (변리사 답변용 논거)
      </div>
      <p style={{ margin: 0, fontSize: 16, lineHeight: 1.75, fontWeight: 600 }}>
        선행기술 A·B는 <strong>"임의의 텍스트 입력"</strong>을 전제로 한 일반
        기법입니다. 본 청구항의 <strong>"객관식 문장형 문제"</strong> 한정은
        단순한 입력 제한이 아니라, 5개 단계 모두에 <strong>구조적 제약</strong>
        (선택지 간 배타성·정답 유일성·오답 분포)을 부여하므로, 통상의 기술자가
        두 선행기술을 결합해도 본 청구항의 구성에 자명하게 도달할 수 없습니다.
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   KEYFRAMES — 강한 애니메이션
   ═══════════════════════════════════════════════════════ */
const KEYFRAMES = `
  @keyframes flash {
    0% { opacity: 0; }
    30% { opacity: 1; }
    100% { opacity: 0; }
  }

  @keyframes explode {
    0% {
      width: 0;
      height: 0;
      opacity: 1;
    }
    100% {
      width: 600px;
      height: 600px;
      opacity: 0;
    }
  }

  @keyframes stamp {
    0% {
      transform: translate(-50%, -350%) scale(2.8) rotate(-15deg);
      opacity: 0;
    }
    50% {
      transform: translate(-50%, -50%) scale(1.45) rotate(-3deg);
      opacity: 1;
    }
    70% {
      transform: translate(-50%, -50%) scale(0.92) rotate(1deg);
    }
    85% {
      transform: translate(-50%, -50%) scale(1.05) rotate(-0.5deg);
    }
    100% {
      transform: translate(-50%, -50%) scale(1) rotate(0deg);
      opacity: 1;
    }
  }

  @keyframes shockwave {
    0% {
      width: 100px;
      height: 100px;
      opacity: 1;
    }
    100% {
      width: 800px;
      height: 800px;
      opacity: 0;
    }
  }
`;
