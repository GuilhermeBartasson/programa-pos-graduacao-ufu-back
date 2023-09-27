import User from '../models/user';
import db from '../config/database';

export default class UserDAL {

    public static async createApplicantUser(user: User) {
        const { email, firstName, middleName, lastName, password, salt } = user;

        try {
            const { rows } = await db.query(
                "INSERT INTO users (email, firstName, middleName, lastName, password, salt, role, active) VALUES ($1, $2, $3, $4, $5, $6, 'applicant', TRUE)",
                [email, firstName, middleName, lastName, password, salt]
            );
        } catch (err) {
            throw err;
        }
    }

}
