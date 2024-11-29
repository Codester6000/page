import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from "./Auth";
import { SearchProvider } from './searchContext.jsx';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SearchProvider>
        <App />
        </SearchProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
