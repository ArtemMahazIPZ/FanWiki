const API_BASE = import.meta.env.VITE_API_URL || '';

export const getImageUrl = (path: string | undefined | null): string | undefined => {
    if (!path) return undefined;
    return `${API_BASE}${path}`;
};
