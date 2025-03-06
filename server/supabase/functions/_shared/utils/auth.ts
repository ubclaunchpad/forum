import { supa } from "../db.ts";
import { NotFoundError } from "../errors.ts";


export async function signUpByEmailPassword(email: string, password: string, args: Record<string, unknown> = {}) {
    const { data, error } = await supa.auth.signUp({
        email,
        password,
        options: {
            data: args,
        },
    });

    if (error) {
        throw new Error(error.message);
    }

    if (!data.user) {
        throw new Error("User not found");
    }

    return data.user;
}


export async function deleteUser(userId: string) {
    const { error } = await supa.auth.admin.deleteUser(userId);
    if (error) {
        throw new Error(error.message);
    }
}
