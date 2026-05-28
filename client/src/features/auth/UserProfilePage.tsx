import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/axios';
import { useTranslation } from 'react-i18next';


export const UserProfilePage = () => {
    const { user, login, logout } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [avatarLoading, setAvatarLoading] = useState(false);

    const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5 MB hard limit
    const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    const [nickname, setNickname] = useState('');
    const [profileLoading, setProfileLoading] = useState(false);

    const [showDeleteSection, setShowDeleteSection] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        if (user) setNickname(user.nickname);
    }, [user]);

    useEffect(() => {
        return () => { if (preview) URL.revokeObjectURL(preview); };
    }, [preview]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (!ALLOWED_MIME_TYPES.includes(selectedFile.type)) {
            alert(t('profile.file_unsupported'));
            e.target.value = '';
            return;
        }

        if (selectedFile.size > MAX_AVATAR_SIZE) {
            alert(t('profile.file_too_large'));
            e.target.value = '';
            return;
        }

        // Revoke any previous object URL to avoid memory leaks.
        if (preview) URL.revokeObjectURL(preview);

        try {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        } catch {
            setFile(null);
            setPreview(null);
            alert(t('profile.avatar_error'));
        }
    };

    const handleAvatarUpload = async () => {
        if (!file || !user) return;
        setAvatarLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Do NOT set Content-Type manually — the browser must add the multipart
            // boundary automatically. Forcing it strips the boundary and breaks
            // iOS Safari's multipart parser.
            const res = await api.post('/Account/avatar', formData);

            if (res.data.token) {
                login(res.data.token);
            }

            setFile(null);
            alert(t('profile.avatar_updated'));
        } catch (error) {
            console.error(error);
            alert(t('profile.avatar_error'));
        } finally {
            setAvatarLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) return;
        if (!window.confirm(t('profile.delete_confirm_final'))) return;
        setDeleteLoading(true);
        try {
            await api.delete('/Account/me', { data: { password: deletePassword } });
            logout();
            navigate('/');
        } catch {
            alert(t('profile.delete_error'));
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleProfileUpdate = async () => {
        if (!user || !nickname.trim()) return;
        setProfileLoading(true);

        try {
            const res = await api.put('/Account/details', { nickname });

            if (res.data.token) {
                login(res.data.token);
            }

            alert(t('profile.profile_updated'));
        } catch (error) {
            console.error(error);
            alert(t('profile.profile_error'));
        } finally {
            setProfileLoading(false);
        }
    };

    if (!user) {
        return <div className="p-10 text-center text-white text-xl">{t('profile.loading')}</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 mt-10 animate-in fade-in">
            <h1 className="text-3xl font-bold text-white mb-8">{t('profile.title')}</h1>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col md:flex-row gap-10 items-start shadow-lg">

                <div className="flex flex-col items-center gap-4 w-full md:w-auto">
                    <div className="w-40 h-40 rounded-full border-4 border-slate-700 overflow-hidden bg-slate-800 shadow-2xl relative group">
                        <img
                            src={preview || (user.avatarUrl || "https://via.placeholder.com/150")}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                        <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-white font-bold text-sm">
                            {t('profile.upload_avatar')}
                            <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFileChange} />
                        </label>
                    </div>

                    {file && (
                        <button
                            onClick={handleAvatarUpload}
                            disabled={avatarLoading}
                            className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold transition disabled:opacity-50"
                        >
                            {avatarLoading ? '...' : t('profile.save')}
                        </button>
                    )}
                </div>

                <div className="flex-1 space-y-6 w-full">

                    <div>
                        <label className="block text-slate-400 text-sm font-bold uppercase mb-2">{t('profile.nickname')}</label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="w-full text-xl text-white font-mono bg-slate-950 p-3 rounded border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-slate-400 text-sm font-bold uppercase mb-2">{t('profile.email')}</label>
                        <div className="text-xl text-slate-500 font-mono bg-slate-950/50 p-3 rounded border border-slate-800 cursor-not-allowed select-none">
                            {user.username}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                        <div>
                            <span className="text-slate-500 text-sm mr-2">{t('profile.role')}: </span>
                            <span className="text-emerald-400 font-bold uppercase">{user.role}</span>
                        </div>

                        <button
                            onClick={handleProfileUpdate}
                            disabled={profileLoading || nickname === user.nickname}
                            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded font-bold transition"
                        >
                            {profileLoading ? t('profile.updating') : t('profile.save')}
                        </button>
                    </div>
                </div>
            </div>
            <div className="mt-8 bg-slate-900 border border-red-900/40 rounded-xl p-6 shadow-lg">
                <h2 className="text-lg font-bold text-red-400 mb-1">{t('profile.delete_account')}</h2>
                <p className="text-slate-500 text-sm mb-4">{t('profile.delete_warning')}</p>

                {!showDeleteSection ? (
                    <button
                        onClick={() => setShowDeleteSection(true)}
                        className="px-5 py-2 bg-red-900/30 hover:bg-red-900/50 border border-red-800 text-red-300 rounded-lg text-sm font-bold transition"
                    >
                        {t('profile.delete_account')}
                    </button>
                ) : (
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                        <input
                            type="password"
                            placeholder={t('profile.delete_password_placeholder')}
                            value={deletePassword}
                            onChange={e => setDeletePassword(e.target.value)}
                            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-red-500 outline-none transition w-full sm:w-64"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteLoading || !deletePassword}
                                className="px-4 py-2 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg text-sm font-bold transition"
                            >
                                {deleteLoading ? '...' : t('profile.delete_confirm_button')}
                            </button>
                            <button
                                onClick={() => { setShowDeleteSection(false); setDeletePassword(''); }}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition"
                            >
                                {t('profile.cancel')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
