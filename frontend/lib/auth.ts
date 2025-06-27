import { v4 as uuid } from "uuid"
import { encode as defaultEncode } from "next-auth/jwt";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm"
import NextAuth, { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { schema } from "@/lib/schema"
import { db } from "@/lib/db"
import { users, sessions } from "@/lib/db/schema"

export const authConfig = {
    adapter: DrizzleAdapter(db),
    providers: [Credentials({
        credentials: {
            name: {},
            password: {},
        },
        authorize: async (credentials) => {
            const validatedCredentials = schema.parse(credentials);

            const user = await db.select().from(users)
                .where(
                    eq(users.name, validatedCredentials.name)
                )
                .then(res => res[0]);

            if (!user) {
                throw new Error("Invalid credentials.");
            }

            const passwordMatch = await bcrypt.compare(
                validatedCredentials.password,
                user.password as string
            );

            if (!passwordMatch) {
                throw new Error("password is incorrect.");
            }

            return {
                id: user.id,
                name: user.name,
                avatarUrl: user.image || undefined
            };
        },
    })],
    callbacks: {
        async jwt({ token, account, user }) {
            if (account?.provider === "credentials") {
                token.credentials = true;
            }
            if (user) {
                token.id = user.id;
                token.avatarUrl = user.image;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.image = token.avatarUrl as string | undefined;
            }
            return session;
        },
    },
    jwt: {
        encode: async function (params) {
            if (params.token?.credentials) {
                if (!params.token.sub) {
                    throw new Error("No user ID found in token");
                }

                const existingSessions = await db.query.sessions.findMany({
                    where: eq(sessions.userId, params.token.sub)
                });

                const now = new Date();
                let sessionToken;

                const validSession = existingSessions.find(session =>
                    new Date(session.expires) > now
                );

                if (validSession) {
                    sessionToken = validSession.sessionToken;
                    await db.update(sessions)
                        .set({
                            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                        })
                        .where(eq(sessions.sessionToken, sessionToken));
                } else {
                    for (const session of existingSessions) {
                        if (new Date(session.expires) <= now) {
                            await db.delete(sessions)
                                .where(eq(sessions.sessionToken, session.sessionToken));
                        }
                    }

                    sessionToken = uuid();
                    const createdSession = await (authConfig.adapter as any)?.createSession?.({
                        sessionToken: sessionToken,
                        userId: params.token.sub,
                        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    });

                    if (!createdSession) {
                        throw new Error("Failed to create session");
                    }
                }

                return sessionToken;
            }
            return defaultEncode(params);
        },
    },
} satisfies NextAuthConfig

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig)