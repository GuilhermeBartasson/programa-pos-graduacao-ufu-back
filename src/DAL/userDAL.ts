import User from '../models/user';
import db from '../config/database';

export default class UserDAL {

    public static async createApplicantUser(user: User): Promise<void> {
        const { email, firstName, middleName, lastName, password, salt, validationCode } = user;

        try {
            await db.query(
                "INSERT INTO users (email, firstName, middleName, lastName, password, salt, role, active, validated, validationCode) " +
                "VALUES ($1, $2, $3, $4, $5, $6, 'applicant', TRUE, FALSE, $7)",
                [email, firstName, middleName, lastName, password, salt, validationCode]
            );
        } catch (err) {
            throw err;
        }
    }

    public static async validateApplicantAccount(validationCode: string): Promise<void> {
        try {
            await db.query('UPDATE users SET validated = TRUE, validationDate = NOW()::timestamp WHERE validationCode = $1', [validationCode]);
        } catch (err) {
            throw err;
        }
    }

    public static async updatePassword(password: string, salt: string, passwordResetCode: string): Promise<void> {
        try {
            await db.query('UPDATE users SET password = $1, salt = $2 WHERE passwordResetCode = $3', [password, salt, passwordResetCode]);
        } catch (err) {
            throw err;
        }
    }

    public static async isPasswordResetExpired(passwordResetCode: string): Promise<boolean> {
        try {
            const { rows } = await db.query('SELECT * FROM users WHERE passwordResetCode = $1 and Now() < passwordResetDate', [passwordResetCode]);

            return rows.length > 0;
        } catch (err) {
            throw err;
        }
    }

    public static async getUserByMail(email: string): Promise<User | undefined> {
        try {
            const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
            let user: User | undefined = undefined

            if (rows.length > 0) {
                user = rows[0];
            } else {
                throw 'Não foi possível encontrar uma conta vinculada ao email informado';
            }

            return user;
        } catch (err) {
            throw err;
        }
    }

    public static async setUserPasswordResetCode(email: string, passwordResetCode: string): Promise<void> {
        try {
            await db.query('UPDATE users SET passwordResetCode = $1, passwordresetexpiration = (Now() + INTERVAL \'15 minutes\')::timestamp WHERE email = $2', [passwordResetCode, email]);
        } catch (err) {
            throw err;
        }
    }

}
