import { QueryResult } from 'pg';
import db from '../config/database';
import ResearchLine from '../models/researchLine';
import Teacher from '../models/teacher';

export default class ResearchLineDAL {

    public static async createResearchLine(researchLine: ResearchLine): Promise<void> {
        const { name, collegeId } = researchLine;

        try {
            await db.query('INSERT INTO researchLines (name, collegeId, active, deleted) VALUES ($1, $2, TRUE, FALSE)', [name, collegeId]);

            let id = (await db.query('SELECT id FROM researchLines WHERE name = $1', [researchLine.name]))?.rows[0]?.id;

            for (let x in researchLine.teachers) {
                await db.query('INSERT INTO researchLineTeachers (researchLineId, teacherId) VALUES ($1, $2)', [id, researchLine.teachers[parseInt(x)].id])
            }
        } catch (err) {
            throw err;
        }
    }

    public static async getResearchLines(collegeId: string, showDeleted: boolean = false): Promise<ResearchLine[]> {
        let response: ResearchLine[] = [];
        let result: QueryResult<any> | undefined;

        try {
            let query: string = "SELECT * FROM researchLines WHERE collegeId = $1";
            const values: any[] = [collegeId];

            if (!showDeleted) query += ' AND deleted = false';
            
            result = await db.query(query, values);
            
            if (result.rowCount > 0) {
                await Promise.all(result.rows.map(async (row: any) => {
                    let researchLine: ResearchLine = {
                        id: row.id,
                        name: row.name,
                        collegeId: row.collegeid
                    }

                    researchLine.teachers = await this.getResearchLineTeachers(row.id);

                    response.push(researchLine);
                }));
            }
        } catch (err) {
            throw err;
        }

        return response;
    }

    public static async getResearchLineTeachers(researchLineId: number): Promise<Teacher[]> {
        const response: Teacher[] = [];
        let result: QueryResult<any> | undefined;

        try {
            const query: string =   'SELECT t.id, t.collegeId, t.email, t.name, t.personalPageLink as personalPageLink, t.active, t.deleted ' + 
                                    'FROM teachers t INNER JOIN researchLineTeachers rt ON t.id = rt.teacherId ' + 
                                    'WHERE rt.researchLineId = $1';
            const values: any = [researchLineId];

            result = await db.query(query, values);

            if (result.rowCount > 0) {
                result.rows.forEach(row => {
                    response.push({
                        id: row.id,
                        collegeId: row.id,
                        name: row.name,
                        personalPageLink: row.personalPageLink,
                        email: row.email,
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

    public static async deleteResearchLine(id: number): Promise<void> {
        try {
            await db.query('UPDATE researchLines SET deleted = TRUE WHERE id = $1', [id]);
        } catch (err) {
            throw err;
        }
    }

    public static async updateResearchLine(researchLine: ResearchLine): Promise<void> {
        let { name, id, teachers, collegeId } = researchLine;

        try {
            await db.query('UPDATE researchLines SET name = $1, collegeId = $3 WHERE id = $2', [name, id, collegeId]);

            let teacherIds: number[] = [];

            teachers?.forEach(teacher => {
                if (teacher.id !== undefined) teacherIds.push(teacher.id);
            });

            await db.query('DELETE FROM researchLineTeachers WHERE researchLineId = $1 AND NOT (teacherId = ANY ($2))', [researchLine.id, teacherIds]);

            for (let y in teacherIds) {
                await db.query(
                    'INSERT INTO researchLineTeachers (researchLineId, teacherId) SELECT $1, $2 ' + 
                    'WHERE NOT EXISTS(SELECT researchLineId, teacherId FROM researchLineTeachers WHERE researchLineId = $1 AND teacherId = $2)',
                    [researchLine.id, teacherIds[parseInt(y)]]
                );
            }
        } catch (err) {
            throw err;
        }
    }

}