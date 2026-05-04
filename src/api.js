/**
 * api.js — Railway 백엔드 호출 wrapper
 *
 * 환경변수 VITE_API_BASE 로 백엔드 주소 변경 가능.
 * .env 파일:
 *   VITE_API_BASE=https://cloudflareprj-production.up.railway.app
 */

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "https://cloudflareprj-production.up.railway.app";

// ──────────────────────────────────────────────────────────────
// 1. 헬스체크
// ──────────────────────────────────────────────────────────────
export async function healthCheck() {
  const res = await fetch(`${API_BASE}/api/diagnostic/health`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ──────────────────────────────────────────────────────────────
// 2. 메타 미리보기 (3초 응답)
// ──────────────────────────────────────────────────────────────
export async function fetchPreview({
  major = "electrical",
  months = 6,
  seed = 42,
  limit = 12,
} = {}) {
  const params = new URLSearchParams({
    major,
    months: String(months),
    seed: String(seed),
    limit: String(limit),
  });
  const res = await fetch(`${API_BASE}/api/diagnostic/preview?${params}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

// ──────────────────────────────────────────────────────────────
// 3. SSE로 12문제 progressive 생성
// ──────────────────────────────────────────────────────────────
/**
 * @param {Object} opts - { major, months, seed, limit }
 * @param {Object} handlers - {
 *     onMetaSelected: (data) => void,
 *     onQuestion: (question) => void,
 *     onError: (err) => void,
 *     onDone: (data) => void,
 *     onConnectionError: (err) => void,
 *   }
 * @returns {Function} cleanup function (호출 시 SSE 연결 종료)
 */
export function streamGeneration(opts = {}, handlers = {}) {
  const {
    major = "electrical",
    months = 6,
    seed = 42,
    limit = 12,
    excludeQUids = [],
  } = opts;

  // EventSource는 GET만 지원하지만 우리는 POST가 필요함.
  // → fetch + ReadableStream 으로 SSE 직접 파싱.
  const ctrl = new AbortController();

  fetch(`${API_BASE}/api/diagnostic/generate/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_prior: { major, months },
      seed,
      limit,
      exclude_q_uids: excludeQUids,
    }),
    signal: ctrl.signal,
  })
    .then(async (res) => {
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // SSE 메시지 분리: '\n\n'
        const messages = buffer.split("\n\n");
        buffer = messages.pop(); // 마지막은 미완성일 수 있음

        for (const msg of messages) {
          if (!msg.trim()) continue;
          const parsed = parseSSE(msg);
          if (!parsed) continue;
          dispatch(parsed, handlers);
        }
      }
      // 마지막 잔여
      if (buffer.trim()) {
        const parsed = parseSSE(buffer);
        if (parsed) dispatch(parsed, handlers);
      }
    })
    .catch((err) => {
      if (err.name === "AbortError") return;
      handlers.onConnectionError?.(err);
    });

  // cleanup
  return () => ctrl.abort();
}

function parseSSE(msg) {
  let event = "message";
  let data = "";
  for (const line of msg.split("\n")) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) data += line.slice(5).trim();
  }
  if (!data) return null;
  try {
    return { event, data: JSON.parse(data) };
  } catch {
    return { event, data };
  }
}

function dispatch({ event, data }, handlers) {
  switch (event) {
    case "meta_selected":
      handlers.onMetaSelected?.(data);
      break;
    case "question":
      handlers.onQuestion?.(data);
      break;
    case "error":
      handlers.onError?.(data);
      break;
    case "done":
      handlers.onDone?.(data);
      break;
  }
}
