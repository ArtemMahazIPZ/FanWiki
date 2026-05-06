import { useEffect, useState } from 'react';
import { api } from '../../api/axios';
import { useReports } from '../../context/ReportContext';
import { useTranslation } from 'react-i18next';

interface Report {
    id: number;
    reason: string;
    targetUrl: string;
    senderName: string;
    status: 0 | 1 | 2;
    createdAt: string;
}

export const ReportsPage = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const { refreshPendingReports } = useReports();
    const { t } = useTranslation();

    useEffect(() => {
        loadReports();
        refreshPendingReports();
    }, []);

    const loadReports = async () => {
        const res = await api.get('/Reports');
        setReports(res.data);
    };

    const handleStatus = async (id: number, status: 1 | 2) => {
        await api.put(`/Reports/${id}/status`, { status });
        loadReports();
        refreshPendingReports();
    };

    const getStatusBadge = (status: number) => {
        if (status === 0) return <span className="text-yellow-400">{t('admin.status_pending')}</span>;
        if (status === 1) return <span className="text-emerald-400">{t('admin.status_accepted')}</span>;
        return <span className="text-red-400">{t('admin.status_rejected')}</span>;
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-emerald-400 mb-6">{t('admin.reports_title')}</h2>

            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-sm">
                    <tr>
                        <th className="p-4">{t('admin.report_from')}</th>
                        <th className="p-4">{t('admin.report_reason')}</th>
                        <th className="p-4">{t('admin.report_context')}</th>
                        <th className="p-4">{t('admin.report_status')}</th>
                        <th className="p-4">{t('admin.report_actions')}</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                    {reports.map(repo => (
                        <tr key={repo.id} className="hover:bg-slate-800/50">
                            <td className="p-4 font-bold">{repo.senderName}</td>
                            <td className="p-4">{repo.reason}</td>
                            <td className="p-4">
                                {repo.targetUrl && (
                                    <a href={repo.targetUrl} target="_blank" className="text-emerald-500 underline text-sm">
                                        {t('admin.report_link')}
                                    </a>
                                )}
                            </td>
                            <td className="p-4">{getStatusBadge(repo.status)}</td>
                            <td className="p-4 flex gap-2">
                                {repo.status === 0 && (
                                    <>
                                        <button
                                            onClick={() => handleStatus(repo.id, 1)}
                                            className="px-3 py-1 bg-emerald-600/20 text-emerald-400 rounded hover:bg-emerald-600/40"
                                        >
                                            ✓
                                        </button>
                                        <button
                                            onClick={() => handleStatus(repo.id, 2)}
                                            className="px-3 py-1 bg-red-600/20 text-red-400 rounded hover:bg-red-600/40"
                                        >
                                            ✕
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                {reports.length === 0 && <div className="p-8 text-center text-slate-500">{t('admin.report_empty')}</div>}
            </div>
        </div>
    );
};
