import { useState } from "react";
import { COLORS, FONT, SHADOW } from "../theme.js";

/**
 * Claim1RiskPage — 청구항 1 진보성 위협 분석 (홍성훈 변리사 검토용)
 *
 * 라우팅 추가 예시 (App.jsx):
 *   import Claim1RiskPage from "./pages/Claim1RiskPage.jsx";
 *   <Route path="/demo/claim1-risk" element={<Claim1RiskPage />} />
 *
 * HomePage CTA 추가 예시:
 *   <CTACard to="/demo/claim1-risk" accent={COLORS.pink} ... />
 */

const STEPS = [
  {
    id: 1,
    short: "의미 단위 분해",
    full: "문장형 문제를 구성하는 질문 요소 및 선택지 요소를 의미 단위로 분해하는 단계",
    side: "left",
    prior: {
      field: "NLP / Information Extraction",
      tech: "Tokenization · Semantic Parsing",
      since: "1990s~",
      note: "문장을 의미 단위(토큰·구·절)로 분해하는 것은 자연어 처리의 가장 기초적 전처리. 입력이 객관식인지 주관식인지는 형식적 차이일 뿐, 분해 기법 자체에 신규성을 인정받기 어려움.",
    },
  },
  {
    id: 2,
    short: "노드·엣지 그래프 변환",
    full: "질문·선택지 요소를 노드로, 의미적·구조적 관계를 엣지로 하는 복수의 문항 구조로 변환하는 단계",
    side: "left",
    prior: {
      field: "Knowledge Graph / Semantic Network",
      tech: "Text-to-Graph · OpenIE · AMR Parsing",
      since: "2000년대 초~",
      note: '문장에서 개체와 관계를 추출하여 그래프로 표현하는 기법은 다수 선행문헌(Stanford OpenIE, AMR, KG Construction). "객관식"이라는 입력 한정만으로 진보성 확보가 어려움.',
    },
  },
  {
    id: 3,
    short: "임베딩 생성",
    full: "복수의 문항 구조에 신경망 또는 임베딩 기법을 적용하여 질문·선택지 임베딩을 생성하는 단계",
    side: "right",
    prior: {
      field: "Representation Learning",
      tech: "Word2Vec · GloVe · BERT · Sentence-Transformers",
      since: "2013~",
      note: "텍스트 단위(단어·문장)를 벡터로 임베딩하는 기법은 표준 기술. 그래프 노드 임베딩(Node2Vec, GraphSAGE)도 2014년 이후 공지기술.",
    },
  },
  {
    id: 4,
    short: "유사도·거리 연산",
    full: "질문 임베딩과 선택지 임베딩 간 유사도·거리 연산을 수행하여 각 선택지 점수 벡터를 산출하는 단계",
    side: "right",
    prior: {
      field: "Vector Similarity Search",
      tech: "Cosine Similarity · Euclidean Distance · FAISS",
      since: "벡터 표현 등장과 동시",
      note: "임베딩 벡터 간 유사도/거리 계산은 표현학습의 자연스러운 후속 연산. 수많은 QA·검색 시스템이 채택한 표준 결합 방식.",
    },
  },
  {
    id: 5,
    short: "정답 결정",
    full: "점수 벡터에 기초하여 선택지들 중 하나를 정답으로 결정하는 단계",
    side: "right",
    prior: {
      field: "Multiple Choice QA",
      tech: "argmax over candidate scores",
      since: "QA 시스템 표준",
      note: "argmax 기반 선택은 다지선다 QA의 표준 결정 방식. SQuAD·RACE·MMLU 등 모든 객관식 벤치마크가 동일 구조 사용.",
    },
  },
];

const PRIOR_LEFT = {
  title: "Prior Art A — 텍스트 → 지식그래프 변환",
  badge: "KG EXTRACTION",
  color: COLORS.pink,
  examples: [
    "Stanford OpenIE (2015) — 문장에서 (subject, relation, object) 트리플 추출",
    "AMR Parsing (Banarescu et al., 2013) — 문장의 의미 표현을 그래프로",
    "Text-to-Graph for QA — 질의·문맥을 그래프화하는 다수 학술논문",
  ],
  threat: "청구항 1의 단계 1·2를 단독으로 커버",
};

const PRIOR_RIGHT = {
  title: "Prior Art B — 임베딩 + 유사도 기반 QA",
  badge: "EMBEDDING QA",
  color: COLORS.cyan,
  examples: [
    "Word2Vec (Mikolov, 2013) — 단어를 벡터 공간에 임베딩",
    "Sentence-BERT (Reimers, 2019) — 문장 임베딩 + cosine similarity",
    "MC-QA via embedding distance — 다수의 공지 시스템",
  ],
  threat: "청구항 1의 단계 3·4·5를 단독으로 커버",
};

export default function Claim1RiskPage() {
  const [activeId, setActiveId] = useState(2);
  const current = STEPS.find((s) => s.id === activeId);

  return (
    <div style={{ padding: "48px 40px", maxWidth: 1180, margin: "0 auto" }}>
      {/* ─────────── 헤더 ─────────── */}
      <div style={{ marginBottom: 32 }}>
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
            fontSize: 44,
            fontWeight: 800,
            margin: 0,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            background: `linear-gradient(135deg, ${COLORS.dark}, ${COLORS.pink} 60%, ${COLORS.orange})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          청구항 1 진보성 분석
          <br />
          선행기술 결합 매핑
        </h1>
        <p
          style={{
            marginTop: 14,
            fontSize: 15,
            color: COLORS.textDim,
            lineHeight: 1.6,
          }}
        >
          P-03 학습 콘텐츠 자동 생성 / 청구항 1의 5단계가{" "}
          <strong>두 공지 분야의 단순 결합</strong>으로 분해될 수 있는지
          검토합니다.
          <br />
          홍성훈 변리사 검토용 · 2026.05.07
        </p>
      </div>

      {/* ─────────── 청구항 원문 인용 ─────────── */}
      <div
        style={{
          padding: "22px 26px",
          background: COLORS.glass,
          backdropFilter: "blur(20px)",
          borderRadius: 16,
          borderLeft: `4px solid ${COLORS.dark}`,
          marginBottom: 20,
          boxShadow: SHADOW.sm,
        }}
      >
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 10,
            color: COLORS.textDim,
            letterSpacing: "0.18em",
            marginBottom: 10,
            fontWeight: 700,
          }}
        >
          CLAIM 1 — VERBATIM
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 14.5,
            lineHeight: 1.75,
            color: COLORS.text,
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontStyle: "italic",
          }}
        >
          문제 관리 서버에 의해 수행되는, 학습 또는 평가를 목적으로 제공되는{" "}
          <span
            style={{
              fontStyle: "normal",
              fontWeight: 700,
              color: COLORS.purple,
            }}
          >
            문장형 문제
          </span>
          를 자동으로 풀이하고, 상기 문장형 문제를 기반으로 학습자에게 맞춤형
          문항을 생성해주기 위한 방법으로서, ① 의미 단위 분해, ② 노드·엣지
          그래프 변환, ③ 임베딩 생성, ④ 유사도·거리 연산, ⑤ 정답 결정의 5단계를
          포함하는 방법.
        </p>
      </div>

      {/* ─────────── Risk Note 박스 ─────────── */}
      <div
        style={{
          padding: "18px 22px",
          background: "linear-gradient(135deg, #fff7ed, #ffedd5)",
          border: `1px solid ${COLORS.orange}40`,
          borderRadius: 14,
          marginBottom: 40,
          display: "flex",
          gap: 18,
          alignItems: "flex-start",
          boxShadow: SHADOW.sm,
        }}
      >
        <div
          style={{
            padding: "4px 10px",
            background: COLORS.orange,
            color: COLORS.white,
            fontFamily: FONT.mono,
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.15em",
            borderRadius: 999,
            flexShrink: 0,
            marginTop: 2,
          }}
        >
          RISK
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: COLORS.text,
            lineHeight: 1.65,
          }}
        >
          청구항 1은 입력을 <em>"객관식 문장형 문제"</em>로 한정하고 있으나, 그
          외 5개 단계는 모두 (A) 텍스트→그래프 추출과 (B) 임베딩→유사도 기반 QA,
          두 공지 분야의 직접적 결합으로 분해됨.{" "}
          <strong>입력 한정만으로는 진보성 인정이 어려울 수 있음.</strong>
        </p>
      </div>

      {/* ─────────── ① 5단계 타임라인 ─────────── */}
      <SectionLabel num="①" text="청구항 1 — 5단계 흐름 (단계를 클릭하세요)" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 12,
          marginBottom: 16,
        }}
      >
        {STEPS.map((step) => {
          const isActive = activeId === step.id;
          const sideColor = step.side === "left" ? COLORS.pink : COLORS.cyan;
          return (
            <button
              key={step.id}
              onClick={() => setActiveId(step.id)}
              style={{
                cursor: "pointer",
                textAlign: "left",
                padding: 16,
                borderRadius: 14,
                border: "none",
                background: isActive ? COLORS.dark : COLORS.white,
                color: isActive ? COLORS.white : COLORS.text,
                boxShadow: isActive ? SHADOW.glow(sideColor) : SHADOW.sm,
                transition: "all 0.25s",
                position: "relative",
                overflow: "hidden",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: sideColor,
                }}
              />
              <div
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  color: isActive ? sideColor : COLORS.textDim,
                  marginBottom: 6,
                  marginTop: 4,
                }}
              >
                STEP {String(step.id).padStart(2, "0")}
              </div>
              <div
                style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.35 }}
              >
                {step.short}
              </div>
            </button>
          );
        })}
      </div>

      {/* 선택된 단계 풀텍스트 */}
      <div
        style={{
          padding: "16px 20px",
          background: COLORS.glass,
          backdropFilter: "blur(20px)",
          borderRadius: 12,
          fontSize: 14,
          color: COLORS.text,
          lineHeight: 1.7,
          marginBottom: 44,
          boxShadow: SHADOW.sm,
        }}
      >
        <span
          style={{
            fontFamily: FONT.mono,
            fontSize: 11,
            color: COLORS.textDim,
            marginRight: 10,
            fontWeight: 700,
          }}
        >
          STEP {String(current.id).padStart(2, "0")} ▸
        </span>
        {current.full}
      </div>

      {/* ─────────── ② 선행기술 매핑 ─────────── */}
      <SectionLabel num="②" text="선행기술 매핑 — 좌(KG) / 우(임베딩)" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginBottom: 32,
        }}
      >
        <PriorArtCard
          data={PRIOR_LEFT}
          step={current}
          isActive={current.side === "left"}
        />
        <PriorArtCard
          data={PRIOR_RIGHT}
          step={current}
          isActive={current.side === "right"}
        />
      </div>

      {/* 결합 표시 */}
      <div
        style={{
          position: "relative",
          margin: "16px 0 36px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            height: 1,
            borderTop: `1px dashed ${COLORS.textDim}`,
          }}
        />
        <span
          style={{
            position: "relative",
            display: "inline-block",
            padding: "6px 18px",
            background: COLORS.bg || "#fafafa",
            fontFamily: FONT.mono,
            fontSize: 11,
            color: COLORS.textDim,
            letterSpacing: "0.25em",
            fontWeight: 700,
          }}
        >
          ◆ 단순 결합 (COMBINATION) ◆
        </span>
      </div>

      {/* ─────────── ③ 결론 ─────────── */}
      <div
        style={{
          padding: 30,
          background: COLORS.glass,
          backdropFilter: "blur(20px)",
          borderRadius: 20,
          border: `2px solid ${COLORS.dark}`,
          boxShadow: SHADOW.md,
        }}
      >
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 11,
            color: COLORS.dark,
            letterSpacing: "0.18em",
            marginBottom: 14,
            fontWeight: 800,
          }}
        >
          ③ ANALYSIS — OBVIOUSNESS CONCERN
        </div>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.75,
            color: COLORS.text,
            margin: 0,
          }}
        >
          청구항 1의 단계 1·2는 <strong>지식그래프 추출 분야</strong>에서, 단계
          3·4·5는 <strong>임베딩·유사도 기반 QA 분야</strong>에서 각각 공지된
          기법이며, 두 분야는 모두 "텍스트 입력에 대한 의미 표현"이라는 동일한
          기술 영역에 속하므로 통상의 기술자가 결합할 동기(motivation to
          combine)를 인정받을 가능성이 높습니다.
        </p>

        <div
          style={{
            marginTop: 22,
            padding: 20,
            background: COLORS.white,
            borderRadius: 14,
            borderLeft: `4px solid ${COLORS.purple}`,
          }}
        >
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 10,
              color: COLORS.purple,
              fontWeight: 800,
              letterSpacing: "0.18em",
              marginBottom: 10,
            }}
          >
            ▶ 대응 전략 (제안)
          </div>
          <ol
            style={{
              margin: 0,
              paddingLeft: 22,
              fontSize: 14,
              lineHeight: 1.85,
              color: COLORS.text,
            }}
          >
            <li>
              <strong>객관식 입력에 특유한 비자명한 처리 단계</strong>를 청구항
              본문에 도입
              <span style={{ color: COLORS.textDim }}>
                {" "}
                — 선택지 간 상호 의존 제약, 정답 일관성 검증, 오답 분포 학습 등
              </span>
            </li>
            <li>
              결과물(자동 생성문항)이 단순 풀이를 넘어{" "}
              <strong>"맞춤형 문항 생성"으로 환류되는 폐루프 구조</strong>를
              명시
            </li>
            <li>
              종속항에 <strong>도메인 특화 한정</strong> 강화 검토
              (회로해석·법규 적용 등 전기기사 도메인 고유 제약)
            </li>
          </ol>
        </div>
      </div>

      {/* 푸터 */}
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
        <span>Confidential · Attorney Work Product</span>
        <span>elecai.co.kr / Demo Build</span>
      </div>
    </div>
  );
}

/* ─────────────── sub components ─────────────── */

function SectionLabel({ num, text }) {
  return (
    <div
      style={{
        fontFamily: FONT.mono,
        fontSize: 11,
        color: COLORS.textDim,
        letterSpacing: "0.18em",
        marginBottom: 14,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span style={{ fontSize: 16, color: COLORS.purple }}>{num}</span>
      {text.toUpperCase()}
    </div>
  );
}

function PriorArtCard({ data, step, isActive }) {
  return (
    <div
      style={{
        padding: 22,
        background: COLORS.glass,
        backdropFilter: "blur(20px)",
        borderRadius: 18,
        borderLeft: `5px solid ${data.color}`,
        boxShadow: isActive ? SHADOW.glow(data.color) : SHADOW.sm,
        opacity: isActive ? 1 : 0.55,
        transition: "all 0.3s",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {isActive && (
        <div
          style={{
            position: "absolute",
            top: -30,
            right: -30,
            width: 100,
            height: 100,
            background: `radial-gradient(circle, ${data.color}30, transparent 70%)`,
            borderRadius: "50%",
          }}
        />
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 14,
          gap: 10,
        }}
      >
        <h3
          style={{
            fontSize: 16,
            fontWeight: 800,
            margin: 0,
            color: COLORS.text,
            lineHeight: 1.3,
          }}
        >
          {data.title}
        </h3>
        <span
          style={{
            flexShrink: 0,
            padding: "3px 10px",
            background: data.color,
            color: COLORS.white,
            fontFamily: FONT.mono,
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.15em",
            borderRadius: 999,
          }}
        >
          {data.badge}
        </span>
      </div>

      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {data.examples.map((ex, i) => (
          <li
            key={i}
            style={{
              fontSize: 12.5,
              color: COLORS.textDim,
              lineHeight: 1.6,
              marginBottom: 6,
              paddingLeft: 14,
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: 0,
                color: data.color,
                fontWeight: 700,
              }}
            >
              ▸
            </span>
            {ex}
          </li>
        ))}
      </ul>

      <div
        style={{
          marginTop: 14,
          padding: "8px 12px",
          background: `${data.color}15`,
          borderRadius: 8,
          fontSize: 12,
          color: COLORS.text,
          fontStyle: "italic",
        }}
      >
        ⚠ {data.threat}
      </div>

      <div
        style={{
          marginTop: 16,
          paddingTop: 14,
          borderTop: `1px solid ${COLORS.textDim}25`,
        }}
      >
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 9,
            color: COLORS.textDim,
            fontWeight: 700,
            letterSpacing: "0.18em",
            marginBottom: 8,
          }}
        >
          ▼ 이 단계와의 매핑
        </div>
        {isActive ? (
          <div style={{ fontSize: 12.5, lineHeight: 1.7 }}>
            <Row label="분야" value={step.prior.field} bold />
            <Row label="기법" value={step.prior.tech} mono />
            <Row label="공지 시점" value={step.prior.since} />
            <p
              style={{
                marginTop: 10,
                marginBottom: 0,
                color: COLORS.text,
                lineHeight: 1.7,
              }}
            >
              {step.prior.note}
            </p>
          </div>
        ) : (
          <div
            style={{
              fontSize: 12,
              color: COLORS.textDim,
              fontStyle: "italic",
            }}
          >
            이 단계는 본 분야와 직접 매핑되지 않음 (반대편 카드 참조)
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, mono, bold }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
      <span style={{ color: COLORS.textDim, minWidth: 60 }}>{label}:</span>
      <span
        style={{
          color: COLORS.text,
          fontWeight: bold ? 700 : 500,
          fontFamily: mono ? FONT.mono : "inherit",
          fontSize: mono ? 11.5 : "inherit",
        }}
      >
        {value}
      </span>
    </div>
  );
}
