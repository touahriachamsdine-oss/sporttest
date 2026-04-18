import { betterAuth } from "better-auth";
import pool from "./db";

export const auth = betterAuth({
    database: pool,
    debug: false,
    emailAndPassword: {
        enabled: true
    }
});
