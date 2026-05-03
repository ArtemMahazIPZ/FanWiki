import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api } from '../api/axios';
import { useAuth } from './AuthContext';

interface ReportContextType {
    pendingReports: number;
    refreshPendingReports: () => void;
}

const ReportContext = createContext<ReportContextType | null>(null);

export const ReportProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [pendingReports, setPendingReports] = useState(0);

    const refreshPendingReports = useCallback(() => {
        if (user?.role === 'Admin') {
            api.get('/Reports/pending-count')
                .then(res => setPendingReports(res.data))
                .catch(console.error);
        }
    }, [user]);

    useEffect(() => {
        refreshPendingReports();
        if (user?.role === 'Admin') {
            const interval = setInterval(refreshPendingReports, 30000);
            return () => clearInterval(interval);
        }
    }, [user, refreshPendingReports]);

    return (
        <ReportContext.Provider value={{ pendingReports, refreshPendingReports }}>
            {children}
        </ReportContext.Provider>
    );
};

export const useReports = () => {
    const context = useContext(ReportContext);
    if (!context) throw new Error("useReports must be used within a ReportProvider");
    return context;
};
