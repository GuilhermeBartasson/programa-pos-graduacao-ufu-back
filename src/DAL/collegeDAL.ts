import db from '../config/database';
import College from '../models/college';

export default class CollegeDAL {

    public static async createCollege(college: College): Promise<void> {
        const { name } = college;

        try {
            await db.query("INSERT INTO colleges (name) VALUES ($1)", [name]);
        } catch (err) {
            throw err;
        }
    }

}