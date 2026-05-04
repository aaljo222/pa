import { Outlet, NavLink } from "react-router-dom";
import { COLORS, FONT } from "./theme.js";

export default function Layout() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        fontFamily: FONT.body,
        color: COLORS.text,
      }}
    >
      <NavBar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function NavBar() {
  const links = [
    { to: "/", label: "Home", end: true },
    { to: "/demo/claim1", label: "청구항 1 데모", external: true },
    { to: "/demo/live", label: "라이브 진단" },
    { to: "/patents", label: "특허 5건" },
    { to: "/about", label: "회사 소개" },
  ];

  return (
    <nav
      style={{
        background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.6)",
        padding: "16px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <NavLink
        to="/"
        style={{
          fontSize: "20px",
          fontWeight: 800,
          color: COLORS.text,
          textDecoration: "none",
          background: `linear-gradient(90deg, ${COLORS.purple}, ${COLORS.pink})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "-0.01em",
        }}
      >
        ◆ ELECAI
      </NavLink>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        {links.map((link) =>
          link.external ? (
            <a
              key={link.to}
              href={link.to}
              target="_blank"
              rel="noopener noreferrer"
              style={navLinkStyle(false)}
            >
              {link.label} ↗
            </a>
          ) : (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              style={({ isActive }) => navLinkStyle(isActive)}
            >
              {link.label}
            </NavLink>
          )
        )}
      </div>
    </nav>
  );
}

function navLinkStyle(isActive) {
  return {
    fontSize: "14px",
    fontWeight: 600,
    color: isActive ? COLORS.white : COLORS.textDim,
    textDecoration: "none",
    padding: "8px 16px",
    borderRadius: "999px",
    background: isActive
      ? `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.pink})`
      : "transparent",
    transition: "all 0.2s",
  };
}

function Footer() {
  return (
    <footer
      style={{
        padding: "32px 40px",
        textAlign: "center",
        fontSize: "12px",
        color: COLORS.textDim,
        borderTop: "1px solid rgba(255, 255, 255, 0.6)",
        marginTop: "60px",
      }}
    >
      <div style={{ marginBottom: "8px" }}>
        © 2026 (주)에이아이컴퍼니 · 대표 이재오
      </div>
      <div style={{ fontFamily: FONT.mono, fontSize: "10px", opacity: 0.7 }}>
        5 patents pending · KOSHA R&D · 2026-12-22 first filing
      </div>
    </footer>
  );
}
