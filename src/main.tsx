import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Silence console.log in production to prevent data leaks
if (import.meta.env.PROD) {
  console.log = () => {};
}

createRoot(document.getElementById("root")!).render(<App />);
