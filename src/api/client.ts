const BASE = import.meta.env.VITE_API_URL as string;

export class ApiError extends Error {
    status: number;
    errors?: Record<string, string[]>; // 422: შეცდომები ველების მიხედვით
    contested?: string[]; // 409: დაკარგული ადგილები

    constructor(
        status: number,
        message: string,
        errors?: Record<string, string[]>,
        contested?: string[],
    ) {
        super(message);
        this.status = status;
        this.errors = errors;
        this.contested = contested;
    }
}

let token: string | null = localStorage.getItem("token");

export const getToken = () => token;

export function setToken(t: string | null) {
    token = t;
    if (t) localStorage.setItem("token", t);
    else localStorage.removeItem("token");
}

// აპი მოგვიანებით დაარეგისტრირებს: ხსნის login მოდალს
// და true-ს აბრუნებს, თუ მომხმარებელი შევიდა
let onUnauthorized: (() => Promise<boolean>) | null = null;

export const setUnauthorizedHandler = (fn: () => Promise<boolean>) => {
    onUnauthorized = fn;
};

type Opts = {
    method?: string;
    body?: unknown; // FormData ან JSON ობიექტი
    params?: Record<string, string | number | string[] | undefined>;
    skipAuthRetry?: boolean; // login/register-ისთვის
};

export async function api<T>(path: string, opts: Opts = {}): Promise<T> {
    const url = new URL(BASE + path);

    for (const [key, value] of Object.entries(opts.params ?? {})) {
        if (value === undefined || value === "") continue;
        if (Array.isArray(value)) {
            value.forEach((v) => url.searchParams.append(`${key}[]`, v));
        } else {
            url.searchParams.set(key, String(value));
        }
    }

    const isForm = opts.body instanceof FormData;

    const res = await fetch(url, {
        method: opts.method ?? "GET",
        headers: {
            Accept: "application/json",
            ...(opts.body && !isForm ? { "Content-Type": "application/json" } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: opts.body
            ? isForm
                ? (opts.body as FormData)
                : JSON.stringify(opts.body)
            : undefined,
    });

    // 401: ვხსნით login მოდალს და შესვლის შემდეგ იგივე მოთხოვნას ვიმეორებთ
    if (res.status === 401 && !opts.skipAuthRetry && onUnauthorized) {
        setToken(null);
        if (await onUnauthorized()) {
            return api<T>(path, { ...opts, skipAuthRetry: true });
        }
    }

    if (res.status === 204) return undefined as T;

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new ApiError(
            res.status,
            data.message ?? "Something went wrong",
            data.errors,
            data.contested,
        );
    }

    return data as T;
}