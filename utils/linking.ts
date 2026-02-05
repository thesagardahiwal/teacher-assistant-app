import { Env } from '@/constants/env';

export const getInviteLink = (token: string) => {
    return `${Env.APP_URL}/invite?token=${token}`;
};
