import db from '../config/database';

export default class ResearchLineDAL {

    public static async createResearchLine(name: string) {
        try {
            await db.query('INSERT INTO researchLines (name, active) VALUES ($1, TRUE)', [name]);
        } catch (err) {
            throw err;
        }
    }

}