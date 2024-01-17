import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Creator from "modules/creator/Creator";

createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
  <Creator />
  // </React.StrictMode>
);
