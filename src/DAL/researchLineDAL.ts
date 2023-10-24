import db from '../config/database';
import ResearchLine from '../models/researchLine';

export default class ResearchLineDAL {

    public static async createResearchLine(name: string) {
        try {
            await db.query('INSERT INTO researchLines (name, active) VALUES ($1, TRUE)', [name]);
        } catch (err) {
            throw err;
        }
    }

    public static async getResearchLines() {
        let researchLines: ResearchLine[] = [];

        try {
            researchLines = (await db.query('SELECT * FROM researchLines', [])).rows;
        } catch (err) {
            throw err;
        }

        return researchLines;
    }

}