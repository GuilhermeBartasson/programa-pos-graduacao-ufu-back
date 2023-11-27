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

    public static async getResearchLines(showDeleted: boolean = false): Promise<ResearchLine[]> {
        let researchLines: ResearchLine[] = [];
        let r: any;

        try {
            let query: string = 'SELECT * FROM researchLines'

            if (!showDeleted) query += ' WHERE deleted = false';

            r = (await db.query(query, [])).rows;

            for (let x in r) {
                researchLines.push({
                    id: r[x].id,
                    name: r[x].name,
                    collegeId: r[x].collegeid
                });
            }

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
        let { name, id, teachers, collegeId } = researchLine;

        try {
            await db.query('UPDATE researchLines SET name = $1, collegeId = $3 WHERE id = $2', [name, id, collegeId]);

            let teacherIds: number[] = [];

            for (let x in teachers) teacherIds.push(teachers[parseInt(x)].id);

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