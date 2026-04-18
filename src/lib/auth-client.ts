import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "", // Set in .env or defaults to window.location.origin
});

export const { signIn, signUp, signOut, useSession } = authClient;
