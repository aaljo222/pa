import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./Layout.jsx";
import HomePage from "./pages/HomePage.jsx";
import PatentsPage from "./pages/PatentsPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import LiveDemoPage from "./pages/LiveDemoPage.jsx";
import PatentClaim1Demo from "./PatentClaim1Demo.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Layout이 있는 페이지들 */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="patents" element={<PatentsPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="demo/live" element={<LiveDemoPage />} />
        </Route>
        {/* 데모는 풀스크린 (Layout 없음) */}
        <Route path="/demo/claim1" element={<PatentClaim1Demo />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
