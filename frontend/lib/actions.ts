/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { Readable } from "stream";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import { eq } from "drizzle-orm";
import { signIn, signOut, auth } from "@/lib/auth";
import { schema } from "@/lib/schema";
import { db } from "@/lib/db";
import { executeAction } from "@/lib/executeaction";
import { users } from "@/lib/db/schema";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function isUserExisted(name: string) {
    const existingUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.name, name)
    });
    console.log(existingUser);
    return existingUser !== undefined;
}

export async function getCurrentUser() {
    const session = await auth();

    if (!session || !session.user) {
        return { isLoggedIn: false, user: null };
    }

    return {
        isLoggedIn: true,
        user: {
            id: session.user.id,
            name: session.user.name,
            avatarUrl: session.user.image
        }
    };
}

async function getCurrentUserIdOrThrow() {
    const session = await auth();
    if (!session || !session.user) {
        throw new Error("用户未登录");
    }
    return session.user.id;
}

async function getUserByIdOrThrow(userId: string) {
    const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, userId)
    });
    if (!user) {
        throw new Error("找不到用户");
    }
    return user;
}

function parseChatHistory(chatHistoryStr: string | null | undefined) {
    if (!chatHistoryStr) return [];
    try {
        return JSON.parse(chatHistoryStr);
    } catch {
        return [];
    }
}

export async function updateChatHistory(newMessage: { sender: 'user' | 'assistant'; content: string }) {
    try {
        const userId = await getCurrentUserIdOrThrow();
        const user = await getUserByIdOrThrow(userId);

        const chatHistory = parseChatHistory(user.chatHistory);
        chatHistory.push(newMessage);

        await db.update(users)
            .set({
                chatHistory: JSON.stringify(chatHistory),
                updatedAt: new Date()
            })
            .where(eq(users.id, userId));
        return { success: true, message: "更新聊天历史成功" };
    } catch (error: any) {
        console.error("更新聊天历史错误:", error);
        return { success: false, message: error.message || "更新聊天历史失败" };
    }
}

export async function getUserChatHistory() {
    try {
        const userId = await getCurrentUserIdOrThrow();
        const user = await getUserByIdOrThrow(userId);

        const chatHistory = parseChatHistory(user.chatHistory);
        return { success: true, message: "获取聊天历史成功", data: chatHistory };
    } catch (error: any) {
        console.error("获取聊天历史错误:", error);
        return { success: false, message: error.message || "获取聊天历史失败", data: [] };
    }
}

export async function deleteChatPair(userMsgIndex: number) {
    try {
        const userId = await getCurrentUserIdOrThrow();
        const user = await getUserByIdOrThrow(userId);

        const chatHistory = parseChatHistory(user.chatHistory);

        if (
            userMsgIndex < 0 ||
            userMsgIndex >= chatHistory.length ||
            chatHistory[userMsgIndex].sender !== 'user'
        ) {
            return { success: false, message: "索引无效或该条不是用户消息" };
        }

        chatHistory.splice(userMsgIndex, 1);
        if (
            userMsgIndex < chatHistory.length &&
            chatHistory[userMsgIndex].sender === 'assistant'
        ) {
            chatHistory.splice(userMsgIndex, 1);
        }

        await db.update(users)
            .set({
                chatHistory: JSON.stringify(chatHistory),
                updatedAt: new Date()
            })
            .where(eq(users.id, userId));

        return { success: true, message: "删除聊天记录成功" };
    } catch (error: any) {
        console.error("删除聊天记录错误:", error);
        return { success: false, message: error.message || "删除聊天记录失败" };
    }
}

export const signUp = async (formData: FormData) => {
    return executeAction({
        actionFn: async () => {
            const name = formData.get("name");
            const password = formData.get("password");
            const avatar = formData.get("avatar") as File | null;
            const validatedData = schema.parse({ name, password });
            const hashedPassword = await bcrypt.hash(validatedData.password, 10);

            let avatarUrl = null;
            if (avatar && avatar.size > 0) {
                const bytes = await avatar.arrayBuffer();
                const buffer = Buffer.from(bytes);

                const result = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'user_avatars',
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );

                    const readableStream = new Readable();
                    readableStream.push(buffer);
                    readableStream.push(null);
                    readableStream.pipe(uploadStream);
                });

                // @ts-expect-error
                avatarUrl = result.secure_url;
            }

            await db.insert(users).values({
                name: validatedData.name,
                password: hashedPassword,
                image: avatarUrl,
            });

            await signIn('credentials', {
                redirect: false,
                name: validatedData.name,
                password: validatedData.password
            });
        },
        successMessage: "注册成功！",
    });
};

export async function logIn(formData: FormData) {
    return executeAction({
        actionFn: async () => {
            await signIn('credentials', formData);
        },
        successMessage: '登录成功！'
    });
}

export async function logOut() {
    await signOut({ redirectTo: '/' });
    return { success: true, message: '退出成功' };
}