// types.ts
export interface User {
    id: number;
    name: string;
    sur_name: string;
    email: string;
}

export interface LoginData {
    email: string;
    password: string;
}