import db from '../config/database';
import ResearchLine from '../models/researchLine';
import Teacher from '../models/teacher';

export default class ResearchLineDAL {

    public static async createResearchLine(researchLine: ResearchLine): Promise<void> {
        try {
            await db.query('INSERT INTO researchLines (name, active, deleted) VALUES ($1, TRUE, FALSE)', [researchLine.name]);

            let id = (await db.query('SELECT id FROM researchLines WHERE name = $1', [researchLine.name]))?.rows[0]?.id;

            for (let x in researchLine.teachers) {
                await db.query('INSERT INTO researchLineTeachers (researchLineId, teacherId) VALUES ($1, $2)', [id, researchLine.teachers[parseInt(x)].id])
            }
        } catch (err) {
            throw err;
        }
    }

    public static async getResearchLines(): Promise<ResearchLine[]> {
        let researchLines: ResearchLine[] = [];

        try {
            researchLines = (await db.query('SELECT * FROM researchLines', [])).rows;

            for (let x in researchLines) {
                let teachers: any[] = (
                    await db.query(
                        'SELECT t.id, t.name, t.personalPageLink as personalPageLink, t.active, t.deleted ' + 
                        'FROM teachers t INNER JOIN researchLineTeachers rt ON t.id = rt.teacherId ' + 
                        'WHERE rt.researchLineId = $1', 
                        [researchLines[parseInt(x)].id])
                    ).rows;

                researchLines[parseInt(x)].teachers = teachers;
            }
        } catch (err) {
            throw err;
        }

        return researchLines;
    }

    public static async deleteResearchLine(id: number): Promise<void> {
        try {
            await db.query('UPDATE researchLines SET deleted = TRUE WHERE id = $1', [id]);
        } catch (err) {
            throw err;
        }
    }

    public static async updateResearchLine(researchLine: ResearchLine): Promise<void> {
        let { teachers } = researchLine;

        try {
            await db.query('UPDATE researchLines SET name = $1 WHERE id = $2', [researchLine.name, researchLine.id]);

            let teacherIds: number[] = [];

            for (let x in teachers) teacherIds.push(teachers[parseInt(x)].id);

            await db.query('DELETE FROM researchLineTeachers WHERE researchLineId = $1 AND teacherId NOT IN ($2)', [researchLine.id, teacherIds]);

            for (let y in teacherIds) {
                await db.query(
                    'INSERT INTO researchLineTeachers (researchLineId, teacherId) SELECT $1, $2' + 
                    'WHERE NOT EXISTS(SELECT researchLineId, teacherId FROM researchLineTeachers WHERE researchLineId = $1 AND teacherId = $2)',
                    [researchLine.id, teacherIds[parseInt(y)]]
                );
            }
        } catch (err) {
            throw err;
        }
    }

}