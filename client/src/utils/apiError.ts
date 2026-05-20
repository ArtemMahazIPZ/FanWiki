import type { AxiosError } from 'axios';

export function extractApiError(error: unknown): string {
    const err = error as AxiosError<any>;
    if (!err.response) return 'Network error — server is unreachable';

    const status = err.response.status;
    const data = err.response.data;

    // Identity errors array: [{code, description}]
    if (Array.isArray(data)) {
        const msgs = data.map((e: any) => e.description || e.code).filter(Boolean);
        return `[${status}] ${msgs.join('; ')}`;
    }

    const text =
        data?.description ??
        data?.message ??
        data?.title ??
        (typeof data === 'string' && data ? data : null);

    return `[${status}] ${text ?? 'Unexpected error'}`;
}
