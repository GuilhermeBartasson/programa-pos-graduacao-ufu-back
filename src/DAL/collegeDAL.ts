import db from '../config/database';
import College from '../models/college';

export default class CollegeDAL {

    public static async createCollege(college: College): Promise<void> {
        const { name } = college;

        try {
            await db.query("INSERT INTO colleges (name, deleted) VALUES ($1, false)", [name]);
        } catch (err) {
            throw err;
        }
    }

    public static async getColleges(showDeleted: boolean = false): Promise<College[]> {
        let colleges: College[] = [];
        let c: any[] = [];

        try {
            let query = 'SELECT * FROM colleges';

            if (!showDeleted) query += ' WHERE deleted = false';

            c = (await db.query(query, [])).rows;
        } catch (err) {
            throw err;
        }

        for (let x in c) {
            colleges.push({
                id: c[x].id,
                name: c[x].name,
                deleted: c[x].deleted
            });
        }

        return colleges;
    }

    public static async updateCollege(college: College): Promise<void> {
        const { id, name } = college;

        try {
            await db.query("UPDATE colleges SET name = $1 WHERE id = $2", [name, id]);
        } catch (err) {
            throw err;
        }
    }

    public static async deleteCollege(id: number): Promise<void> {
        try {
            await db.query("UPDATE colleges SET deleted = TRUE WHERE id = $1", [id]);
        } catch (err) {
            throw err;
        }
    }

}