import * as Linking from 'expo-linking';

export const getInviteLink = (token: string) => {
    return Linking.createURL('/invite', {
        queryParams: { token },
    });
};
