import Teacher from "../models/teacher";
import db from '../config/database';
import { QueryResult } from "pg";

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

    public static async getTeachers(collegeId: number, showDeleted: boolean = false): Promise<Teacher[]> {
        let teachers: Teacher[] = [];
        let t: any;

        try {
            t = (await db.query(`SELECT * FROM teachers WHERE deleted = $1 AND collegeId = $2`, [showDeleted, collegeId])).rows;
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
            let bound: number | undefined = await this.teacherIsBoundToResearchLine(id);

            if (bound) {
                let _collegeId = await this.getTeacherCollegeId(id);

                if (_collegeId !== collegeId) throw 100;
            }

            await db.query(
                "UPDATE teachers SET name = $1, email = $2, personalPageLink = $3, collegeId = $5 WHERE id = $4",
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

    private static async teacherIsBoundToResearchLine(teacherId: number): Promise<number | undefined> {
        let response: QueryResult<any>;
        
        try {
            response = await db.query("SELECT researchLineId FROM researchLineTeachers WHERE teacherId = $1 LIMIT 1", [teacherId]);

            if (response.rowCount > 0) {
                return response.rows[0].researchlineid;
            } else {
                return undefined;
            }
        } catch (err) {
            throw err;
        }
    }

    private static async getTeacherCollegeId(teacherId: number): Promise<number | undefined> {
        let response: QueryResult<any>;

        try {
            response = await db.query("SELECT collegeId FROM teachers WHERE id = $1", [teacherId]);

            if (response.rowCount > 0) {
                return response.rows[0].collegeid;
            } else {
                return undefined;
            }
        } catch (err) {
            throw err;
        }
    }

}
