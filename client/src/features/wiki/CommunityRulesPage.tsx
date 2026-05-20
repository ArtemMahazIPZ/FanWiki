import { useTranslation } from 'react-i18next';

interface RuleItem {
    title: string;
    body: string;
}

export const CommunityRulesPage = () => {
    const { t } = useTranslation();
    const rules = t('rules.items', { returnObjects: true }) as RuleItem[];

    return (
        <div className="max-w-3xl mx-auto mt-10 px-4 pb-16">
            <h1 className="text-4xl font-extrabold text-emerald-400 mb-2">{t('rules.title')}</h1>
            <p className="text-slate-400 mb-10 text-lg">{t('rules.subtitle')}</p>

            <div className="space-y-6">
                {rules.map((rule, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex gap-4 shadow-lg">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-900/50 border border-emerald-800 flex items-center justify-center text-emerald-400 font-extrabold text-lg">
                            {idx + 1}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white mb-1">{rule.title}</h2>
                            <p className="text-slate-400 text-sm leading-relaxed">{rule.body}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
