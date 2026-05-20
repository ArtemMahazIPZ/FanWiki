import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import './i18n';
import { AuthProvider } from './context/AuthContext';
import { ReportProvider } from './context/ReportContext';
import { NotificationProvider } from './context/NotificationContext';
import { ChatProvider } from './context/ChatContext';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <ReportProvider>
                    <NotificationProvider>
                        <ChatProvider>
                            <App />
                        </ChatProvider>
                    </NotificationProvider>
                </ReportProvider>
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>,
);
