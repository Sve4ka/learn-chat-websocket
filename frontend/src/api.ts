// api.ts
import { User, LoginData } from './types';

const API_URL = 'http://localhost:8080';

export const loginUser = async (data: LoginData): Promise<number> => {
    const response = await fetch(`${API_URL}/user/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error('Login failed');
    }

    const result = await response.json();
    return result.userID;
};

export const getUser = async (id: number): Promise<User> => {
    const response = await fetch(`${API_URL}/user/{id}?id=${id}`, {
        method: 'GET',
        headers: {
            'accept': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch user');
    }

    const result = await response.json();
    return result.user;
};