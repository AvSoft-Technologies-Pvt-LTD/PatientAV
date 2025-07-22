import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom"; // Import BrowserRouter for routing
import store from "./context-api/store"; // Import your Redux store
import App from "./App";
import "./index.css"; // Ensure Tailwind styles are loaded

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <BrowserRouter> {/* Wrap App with BrowserRouter */}
      <App />
    </BrowserRouter>
  </Provider>
);