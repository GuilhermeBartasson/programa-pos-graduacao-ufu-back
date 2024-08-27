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
        let response: Teacher[] = [];
        let result: QueryResult<any> | undefined;

        try {
            let query: string = "SELECT * FROM teachers WHERE collegeId = $1";
            const values: any[] = [collegeId];

            if (!showDeleted) query += " AND deleted = false";

            result = await db.query(query, values);

            if (result.rowCount > 0) {
                result.rows.forEach(row => {
                    response.push({
                        personalPageLink: row.personalpagelink,
                        name: row.name,
                        email: row.email,
                        id: row.id,
                        collegeId: row.collegeid,
                        active: row.active,
                        deleted: row.deleted
                    });
                });
            }
        } catch (err) {
            throw err;
        }

        return response;
    }

    public static async updateTeacher(teacher: Teacher): Promise<void> {
        const { id, name, email, personalPageLink, collegeId } = teacher;

        try {
            if (id !== undefined) {
                let bound: number | undefined = await this.teacherIsBoundToResearchLine(id);

                if (bound) {
                    let _collegeId = await this.getTeacherCollegeId(id);

                    if (_collegeId !== collegeId) throw 100;
                }

                await db.query(
                    "UPDATE teachers SET name = $1, email = $2, personalPageLink = $3, collegeId = $5 WHERE id = $4",
                    [name, email, personalPageLink, id, collegeId]
                );
            } else {
                throw 'id de docente não encontrada';
            }
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
