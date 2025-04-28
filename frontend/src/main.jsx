import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./Auth";
import { Provider } from "react-redux";
import { store } from "./redux/store.js";
import { SearchProvider } from "./searchContext.jsx";
createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <SearchProvider>
            <App />
          </SearchProvider>
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>
  </Provider>
);
