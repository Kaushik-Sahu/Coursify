import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RecoilRoot } from 'recoil';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'sonner';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RecoilRoot>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id'}>
        <BrowserRouter>
          <App />
          <Toaster position="bottom-center" richColors closeButton />
        </BrowserRouter>
      </GoogleOAuthProvider>
    </RecoilRoot>
  </StrictMode>
);
