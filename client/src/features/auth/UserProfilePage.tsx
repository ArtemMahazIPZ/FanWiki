import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/axios';
import { useTranslation } from 'react-i18next';

export const UserProfilePage = () => {
    const { user, login } = useAuth();
    const { t } = useTranslation();

    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [avatarLoading, setAvatarLoading] = useState(false);

    const [nickname, setNickname] = useState('');
    const [profileLoading, setProfileLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setNickname(user.nickname);
        }
    }, [user]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleAvatarUpload = async () => {
        if (!file || !user) return;
        setAvatarLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/Account/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.token) {
                login(res.data.token);
            }

            setFile(null);
            alert('Аватар оновлено!');
        } catch (error) {
            console.error(error);
            alert('Помилка завантаження аватару');
        } finally {
            setAvatarLoading(false);
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

            alert('Профіль оновлено!');
        } catch (error) {
            console.error(error);
            alert('Помилка оновлення профілю');
        } finally {
            setProfileLoading(false);
        }
    };

    if (!user) {
        return <div className="p-10 text-center text-white text-xl">Завантаження...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 mt-10 animate-in fade-in">
            <h1 className="text-3xl font-bold text-white mb-8">{t('profile.title')}</h1>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col md:flex-row gap-10 items-start shadow-lg">

                <div className="flex flex-col items-center gap-4 w-full md:w-auto">
                    <div className="w-40 h-40 rounded-full border-4 border-slate-700 overflow-hidden bg-slate-800 shadow-2xl relative group">
                        <img
                            src={preview || (user.avatarUrl ? `http://localhost:5122${user.avatarUrl}` : "https://via.placeholder.com/150")}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                        <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-white font-bold text-sm">
                            {t('profile.upload_avatar')}
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
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
                            <span className="text-slate-500 text-sm mr-2">Role: </span>
                            <span className="text-emerald-400 font-bold uppercase">{user.role}</span>
                        </div>

                        <button
                            onClick={handleProfileUpdate}
                            disabled={profileLoading || nickname === user.nickname}
                            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded font-bold transition"
                        >
                            {profileLoading ? 'Updating...' : t('profile.save')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};