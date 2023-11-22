import Teacher from "../models/teacher";
import db from '../config/database';

export default class TeacherDAL {

    public static async createTeacher(teacher: Teacher): Promise<void> {
        const { name, email, personalPageLink, collegeId } = teacher;

        try {
            await db.query(
                "INSERT INTO teachers (name, personalPageLink, email, collegeId, active, deleted) VALUES ($1, $2, $3, $4, TRUE, FALSE)",
                [name, personalPageLink, email, collegeId]
            );
        } catch (err) {
            throw err;
        }
    }

    public static async getTeachers(showDeleted: boolean = false): Promise<Teacher[]> {
        let teachers: Teacher[] = [];
        let t: any;

        try {
            let query: string = 'SELECT * FROM teachers';

            if (!showDeleted) query += ' WHERE deleted = false';

            t = (await db.query(query, [])).rows;
        } catch (err) {
            throw err;
        }

        for (let x in t) {
            teachers.push({
                personalPageLink: t[x].personalpagelink,
                name: t[x].name,
                email: t[x].email,
                id: t[x].id,
                collegeId: t[x].collegeid,
                active: t[x].active,
                deleted: t[x].deleted
            });
        }

        return teachers;
    }

    public static async updateTeacher(teacher: Teacher): Promise<void> {
        const { id, name, email, personalPageLink, collegeId } = teacher;

        try {
            await db.query(
                "UPDATE teachers SET name = $1, email = $2, personalPageLink = $3, collegeId = $4 WHERE id = $4",
                [name, email, personalPageLink, id, collegeId]
            );
        } catch (err) {
            throw err;
        }
    }

    public static async deleteTeacher(id: number): Promise<void> {
        try {
            await db.query("UPDATE teachers SET deleted = true WHERE id = $1", [id]);
        } catch (err) {
            throw err;
        }
    }

}