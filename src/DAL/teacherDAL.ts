import Teacher from "../models/teacher";
import db from '../config/database';

export default class TeacherDAL {

    public static async createTeacher(teacher: Teacher): Promise<void> {
        const { name, email, personalPageLink } = teacher;

        try {
            await db.query(
                "INSERT INTO teachers (name, personalPageLink, email, active, deleted) VALUES ($1, $2, $3, TRUE, FALSE)",
                [name, personalPageLink, email]
            );
        } catch (err) {
            throw err;
        }
    }

    public static async getTeachers(): Promise<Teacher[]> {
        let teachers: Teacher[] = [];

        try {
            teachers = (await db.query("SELECT * FROM teachers", [])).rows;
        } catch (err) {
            throw err;
        }

        return teachers;
    }

    public static async updateTeacher(teacher: Teacher): Promise<void> {
        const { id, name, email, personalPageLink } = teacher;

        try {
            await db.query(
                "UPDATE teachers SET name = $1, email = $2, personalPageLink = $3 WHERE id = $4",
                [name, email, personalPageLink, id]
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