import { useState, useRef, useEffect } from "react";
import { COLORS, FONT, SHADOW } from "../theme.js";
import { healthCheck, fetchPreview, streamGeneration } from "../api.js";

const PHASE = {
  IDLE: "idle",
  PREVIEWING: "previewing",
  PREVIEW_READY: "preview_ready",
  GENERATING: "generating",
  DONE: "done",
};

export default function LiveDemoPage() {
  const [phase, setPhase] = useState(PHASE.IDLE);
  const [health, setHealth] = useState(null);
  const [preview, setPreview] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [errors, setErrors] = useState([]);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [opts, setOpts] = useState({ major: "electrical", months: 6, seed: 42 });
  const [error, setError] = useState(null);
  const cleanupRef = useRef(null);

  // 마운트 시 헬스체크
  useEffect(() => {
    healthCheck()
      .then(setHealth)
      .catch((err) => setError(`백엔드 연결 실패: ${err.message}`));
    return () => cleanupRef.current?.();
  }, []);

  // ── 1단계: 메타 미리보기 ──
  async function handlePreview() {
    setPhase(PHASE.PREVIEWING);
    setError(null);
    setQuestions([]);
    setErrors([]);
    try {
      const data = await fetchPreview(opts);
      setPreview(data);
      setPhase(PHASE.PREVIEW_READY);
    } catch (err) {
      setError(`Preview 실패: ${err.message}`);
      setPhase(PHASE.IDLE);
    }
  }

  // ── 2단계: SSE로 12문제 생성 ──
  function handleGenerate() {
    setPhase(PHASE.GENERATING);
    setError(null);
    setQuestions([]);
    setErrors([]);
    setProgress({ done: 0, total: 12 });

    cleanupRef.current = streamGeneration(opts, {
      onMetaSelected: (data) => setProgress({ done: 0, total: data.total }),
      onQuestion: (q) => {
        setQuestions((prev) => [...prev, q]);
        setProgress((p) => ({ ...p, done: p.done + 1 }));
      },
      onError: (e) => setErrors((prev) => [...prev, e]),
      onDone: () => {
        setPhase(PHASE.DONE);
        cleanupRef.current = null;
      },
      onConnectionError: (err) => {
        setError(`스트림 연결 오류: ${err.message}`);
        setPhase(PHASE.PREVIEW_READY);
      },
    });
  }

  function handleStop() {
    cleanupRef.current?.();
    cleanupRef.current = null;
    setPhase(PHASE.PREVIEW_READY);
  }

  return (
    <div style={{ padding: "40px 32px", maxWidth: 1280, margin: "0 auto" }}>
      <Header />

      {/* 백엔드 상태 */}
      <HealthStatus health={health} error={error} />

      {/* 컨트롤 패널 */}
      <Controls
        opts={opts}
        setOpts={setOpts}
        phase={phase}
        onPreview={handlePreview}
        onGenerate={handleGenerate}
        onStop={handleStop}
      />

      {/* 진행 상태 */}
      {phase === PHASE.GENERATING && (
        <ProgressBar done={progress.done} total={progress.total} />
      )}

      {/* 메타 미리보기 */}
      {preview && phase !== PHASE.GENERATING && phase !== PHASE.DONE && (
        <PreviewPanel preview={preview} />
      )}

      {/* 생성된 문제들 (progressive) */}
      {questions.length > 0 && (
        <QuestionsList questions={questions} errors={errors} />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// 헤더
// ──────────────────────────────────────────────────────────────
function Header() {
  return (
    <div style={{ marginBottom: 32 }}>
      <div
        style={{
          display: "inline-block",
          padding: "5px 14px",
          background: COLORS.orange,
          color: COLORS.white,
          fontFamily: FONT.mono,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.15em",
          borderRadius: 999,
          marginBottom: 12,
        }}
      >
        ◆ LIVE · 백엔드 연결
      </div>
      <h1
        style={{
          fontSize: 36,
          fontWeight: 800,
          margin: 0,
          letterSpacing: "-0.02em",
        }}
      >
        라이브 진단 — 청구항 1+9+19 실행
      </h1>
      <p
        style={{
          marginTop: 12,
          fontSize: 15,
          color: COLORS.textDim,
          lineHeight: 1.6,
        }}
      >
        1,200문항 메타데이터에서 진단 12문제 선정 → Claude가 본문을 신규
        작성 → 역변환 검증. 전 과정이 라이브로 진행됩니다.
      </p>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// 백엔드 상태
// ──────────────────────────────────────────────────────────────
function HealthStatus({ health, error }) {
  if (error) {
    return (
      <div
        style={{
          padding: 16,
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: 12,
          marginBottom: 24,
          color: "#991b1b",
          fontSize: 14,
        }}
      >
        ⚠️ {error}
      </div>
    );
  }
  if (!health) {
    return (
      <div
        style={{
          padding: 12,
          background: COLORS.white,
          borderRadius: 12,
          marginBottom: 24,
          fontSize: 13,
          color: COLORS.textDim,
        }}
      >
        ⏳ 백엔드 헬스체크 중...
      </div>
    );
  }
  return (
    <div
      style={{
        padding: "12px 16px",
        background: health.ok ? "#f0fdf4" : "#fef2f2",
        border: `1px solid ${health.ok ? "#86efac" : "#fecaca"}`,
        borderRadius: 12,
        marginBottom: 24,
        fontFamily: FONT.mono,
        fontSize: 12,
        display: "flex",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <span style={{ fontWeight: 700, color: health.ok ? "#16a34a" : "#dc2626" }}>
        {health.ok ? "✓ 백엔드 OK" : "✗ 백엔드 오류"}
      </span>
      {health.ok && (
        <>
          <span>풀: {health.pool_size?.toLocaleString()} 문항</span>
          <span>모델: {health.model}</span>
          <span>API key: {health.anthropic_key_set ? "✓" : "✗"}</span>
        </>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// 컨트롤
// ──────────────────────────────────────────────────────────────
function Controls({ opts, setOpts, phase, onPreview, onGenerate, onStop }) {
  const isGenerating = phase === PHASE.GENERATING;
  const isPreviewing = phase === PHASE.PREVIEWING;
  const canGenerate = phase === PHASE.PREVIEW_READY || phase === PHASE.DONE;

  return (
    <div
      style={{
        padding: 24,
        background: COLORS.glass,
        backdropFilter: "blur(20px)",
        borderRadius: 16,
        marginBottom: 24,
        boxShadow: SHADOW.sm,
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr auto auto auto",
        gap: 16,
        alignItems: "end",
      }}
    >
      <Field label="전공">
        <select
          value={opts.major}
          onChange={(e) => setOpts({ ...opts, major: e.target.value })}
          disabled={isGenerating || isPreviewing}
          style={selectStyle}
        >
          <option value="electrical">전기 전공</option>
          <option value="related">관련 전공</option>
          <option value="none">비전공</option>
        </select>
      </Field>
      <Field label="학습 개월수">
        <input
          type="number"
          value={opts.months}
          onChange={(e) => setOpts({ ...opts, months: Number(e.target.value) })}
          disabled={isGenerating || isPreviewing}
          style={inputStyle}
          min={0}
          max={120}
        />
      </Field>
      <Field label="시드 (재현용)">
        <input
          type="number"
          value={opts.seed}
          onChange={(e) => setOpts({ ...opts, seed: Number(e.target.value) })}
          disabled={isGenerating || isPreviewing}
          style={inputStyle}
        />
      </Field>
      <button
        onClick={onPreview}
        disabled={isGenerating || isPreviewing}
        style={btnStyle(COLORS.cyan, isGenerating || isPreviewing)}
      >
        {isPreviewing ? "조회 중..." : "1. 메타 미리보기"}
      </button>
      <button
        onClick={onGenerate}
        disabled={!canGenerate}
        style={btnStyle(COLORS.orange, !canGenerate)}
      >
        {isGenerating ? "생성 중..." : "2. AI 본문 생성 (4-5분)"}
      </button>
      {isGenerating && (
        <button onClick={onStop} style={btnStyle(COLORS.dark, false)}>
          ❚❚ 중단
        </button>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontFamily: FONT.mono,
          fontSize: 10,
          color: COLORS.textDim,
          letterSpacing: "0.1em",
          fontWeight: 700,
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  fontSize: 14,
  fontFamily: FONT.body,
};
const selectStyle = { ...inputStyle, background: COLORS.white };

function btnStyle(color, disabled) {
  return {
    padding: "12px 20px",
    background: disabled ? "#cbd5e1" : color,
    color: COLORS.white,
    border: "none",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.2s",
    fontFamily: FONT.body,
  };
}

// ──────────────────────────────────────────────────────────────
// 진행 막대
// ──────────────────────────────────────────────────────────────
function ProgressBar({ done, total }) {
  const pct = total > 0 ? (done / total) * 100 : 0;
  return (
    <div
      style={{
        padding: 20,
        background: COLORS.white,
        borderRadius: 12,
        marginBottom: 24,
        boxShadow: SHADOW.sm,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
          fontFamily: FONT.mono,
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        <span>📡 생성 진행 중...</span>
        <span style={{ color: COLORS.orange }}>
          {done} / {total} 문제
        </span>
      </div>
      <div
        style={{
          height: 8,
          background: "#f1f5f9",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${COLORS.orange}, ${COLORS.amber})`,
            transition: "width 0.4s ease-out",
            boxShadow: `0 0 12px ${COLORS.orange}`,
          }}
        />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// 메타 프리뷰
// ──────────────────────────────────────────────────────────────
function PreviewPanel({ preview }) {
  return (
    <div
      style={{
        padding: 24,
        background: COLORS.glass,
        backdropFilter: "blur(20px)",
        borderRadius: 16,
        marginBottom: 24,
        boxShadow: SHADOW.md,
      }}
    >
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 11,
          color: COLORS.cyan,
          letterSpacing: "0.15em",
          fontWeight: 700,
          marginBottom: 16,
        }}
      >
        ✓ 메타 12개 선정 완료
      </div>
      <div
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 20,
          fontSize: 13,
        }}
      >
        <Stat label="풀" value={preview.summary.pool_size?.toLocaleString()} />
        <Stat
          label="quota"
          value={Object.entries(preview.summary.quota_used)
            .map(([k, v]) => `${k}=${v}`)
            .join(" · ")}
        />
        <Stat
          label="과목"
          value={Object.keys(preview.summary.coverage.subjects).length + "개"}
        />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 10,
        }}
      >
        {preview.selected_metas.map((m, i) => (
          <MetaCard key={m.q_uid} meta={m} idx={i + 1} />
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 10,
          color: COLORS.textDim,
          letterSpacing: "0.1em",
        }}
      >
        {label}
      </div>
      <div style={{ fontWeight: 700, marginTop: 2 }}>{value}</div>
    </div>
  );
}

const SUBJECT_COLORS = {
  "EE-EM": COLORS.purple,
  "EE-PW": COLORS.pink,
  "EE-CH": COLORS.cyan,
  "EE-CE": COLORS.green,
  "EE-CT": COLORS.orange,
  "EE-KEC": COLORS.amber,
};

function MetaCard({ meta, idx }) {
  const c = SUBJECT_COLORS[meta.subject_code] || COLORS.dark;
  return (
    <div
      style={{
        padding: 12,
        background: COLORS.white,
        borderRadius: 10,
        borderLeft: `3px solid ${c}`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontFamily: FONT.mono,
            fontSize: 11,
            fontWeight: 700,
            color: c,
          }}
        >
          #{idx} · {meta.subject_code}
        </span>
        <span
          style={{
            fontFamily: FONT.mono,
            fontSize: 10,
            color: COLORS.textDim,
            background: "#f1f5f9",
            padding: "2px 8px",
            borderRadius: 999,
          }}
        >
          {meta.difficulty}
        </span>
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
        {meta.concept_ko || meta.topic_ko || meta.chapter_ko}
      </div>
      <div style={{ fontSize: 10, color: COLORS.textDim }}>
        trap: {meta.trap_pattern}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// 생성된 문제 리스트
// ──────────────────────────────────────────────────────────────
function QuestionsList({ questions, errors }) {
  return (
    <div>
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 11,
          color: COLORS.orange,
          letterSpacing: "0.15em",
          fontWeight: 700,
          marginBottom: 16,
        }}
      >
        ◆ 생성된 신규 문제 ({questions.length})
        {errors.length > 0 && (
          <span style={{ color: "#dc2626", marginLeft: 12 }}>
            · 실패 {errors.length}건
          </span>
        )}
      </div>
      <div style={{ display: "grid", gap: 16 }}>
        {questions.map((q) => (
          <QuestionCard key={q.idx} q={q} />
        ))}
      </div>
    </div>
  );
}

function QuestionCard({ q }) {
  const [showSolution, setShowSolution] = useState(false);
  const c = SUBJECT_COLORS[q.subject_code] || COLORS.dark;
  return (
    <div
      style={{
        padding: 24,
        background: COLORS.white,
        borderRadius: 16,
        boxShadow: SHADOW.md,
        borderTop: `4px solid ${c}`,
        animation: "slideIn 0.4s ease-out",
      }}
    >
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 12,
          fontFamily: FONT.mono,
          fontSize: 11,
          flexWrap: "wrap",
        }}
      >
        <Pill color={c}>#{q.idx} · {q.subject_code}</Pill>
        <Pill color={COLORS.textDim}>{q.difficulty}</Pill>
        <Pill color={COLORS.textDim}>{q.trap_pattern}</Pill>
        {q._validation.passed ? (
          <Pill color={COLORS.green}>✓ 검증 통과</Pill>
        ) : (
          <Pill color="#dc2626">⚠ 검증 실패</Pill>
        )}
        <Pill color={COLORS.textDim}>{q._generation.elapsed_sec}s</Pill>
      </div>

      <div
        style={{
          fontSize: 16,
          lineHeight: 1.7,
          marginBottom: 16,
          color: COLORS.text,
        }}
      >
        {q.question_text}
      </div>

      <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
        {q.choices?.map((choice, i) => (
          <div
            key={i}
            style={{
              padding: "10px 14px",
              background:
                i === q.correct_index
                  ? "linear-gradient(135deg, #fed7aa, #fb923c)"
                  : "#f8fafc",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: i === q.correct_index ? 700 : 400,
              color: i === q.correct_index ? "#7c2d12" : COLORS.text,
              border: `1px solid ${
                i === q.correct_index ? COLORS.orange : COLORS.border
              }`,
            }}
          >
            {choice}
            {i === q.correct_index && " ★"}
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowSolution(!showSolution)}
        style={{
          padding: "8px 14px",
          background: "transparent",
          border: `1px solid ${COLORS.border}`,
          borderRadius: 8,
          fontSize: 12,
          cursor: "pointer",
          color: COLORS.textDim,
          fontFamily: FONT.body,
        }}
      >
        {showSolution ? "▲ 풀이 숨기기" : "▼ 단계별 풀이 보기"}
      </button>

      {showSolution && (
        <div
          style={{
            marginTop: 12,
            padding: 16,
            background: "#f8fafc",
            borderRadius: 8,
            fontSize: 13,
            lineHeight: 1.7,
          }}
        >
          {q.solution_steps?.map((step, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <strong style={{ color: c }}>Step {step.step}:</strong>{" "}
              {step.description}
              {step.latex && (
                <code
                  style={{
                    display: "block",
                    marginTop: 4,
                    padding: 8,
                    background: COLORS.white,
                    borderRadius: 4,
                    fontFamily: FONT.mono,
                    fontSize: 12,
                  }}
                >
                  {step.latex}
                </code>
              )}
            </div>
          ))}
          {q.trap_explanation && (
            <div
              style={{
                marginTop: 12,
                padding: 12,
                background: "#fef3c7",
                borderRadius: 6,
                fontSize: 12,
              }}
            >
              💡 <strong>함정 분석:</strong> {q.trap_explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Pill({ color, children }) {
  return (
    <span
      style={{
        padding: "3px 10px",
        background: `${color}15`,
        color,
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.05em",
      }}
    >
      {children}
    </span>
  );
}
