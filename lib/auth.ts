import bcrypt from "bcryptjs";

/**
 * Compare plain text password with BCrypt hash (LimboAuth uses BCrypt)
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
        // LimboAuth hashes often look like $2a$10$...
        return await bcrypt.compare(password, hash);
    } catch (error) {
        console.error("Password verification error:", error);
        return false;
    }
}

/**
 * Hash password for Admin panel storage (if needed) or checking admin
 */
export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
}
