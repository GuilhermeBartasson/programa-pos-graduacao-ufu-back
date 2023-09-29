import User from '../models/user';
import db from '../config/database';

export default class UserDAL {

    public static async createApplicantUser(user: User) {
        const { email, firstName, middleName, lastName, password, salt, validationCode } = user;

        try {
            const { rows } = await db.query(
                "INSERT INTO users (email, firstName, middleName, lastName, password, salt, role, active, validated, validationCode) " +
                "VALUES ($1, $2, $3, $4, $5, $6, 'applicant', TRUE, FALSE, $7)",
                [email, firstName, middleName, lastName, password, salt, validationCode]
            );
        } catch (err) {
            throw err;
        }
    }

    public static async validateApplicantAccount(validationCode: string) {
        try {
            const { rows } = await db.query('UPDATE users SET validated = TRUE, validationDate = NOW()::timestamp WHERE validationCode = $1', [validationCode]);
        } catch (err) {
            throw err;
        }
    }

}
