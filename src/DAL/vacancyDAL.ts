import { PoolClient, QueryResult } from 'pg';
import db from '../config/database';
import Vacancy from '../models/vacancy';

export default class VacancyDAL {

    public static async createVacancy(vacancy: Vacancy, client?: PoolClient): Promise<QueryResult<any> | undefined> {
        let result: QueryResult<any> | undefined;

        try {
            const query: string =   "INSERT INTO vacancy (selectiveProcessId, researchLineId, broadCompetition, ppi, pcd, humanitaryPolitics, modality, targetPublic, timePeriod, deleted) " +
                                    "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, false)"
            const values: any[] = [vacancy.selectiveProcessId, vacancy.researchLineId, vacancy.broadCompetition, vacancy.ppi, vacancy.pcd, vacancy.humanitaryPolitics, vacancy.modality, vacancy.targetPublic, vacancy.period];

            if (client === undefined) result = await db.query(query, values);
            else result = await client.query(query, values)
        } catch (err) {
            throw err;
        }

        return result;
    }

    public static async getVacanciesByProcessId(
        processId: number, showDeleted: boolean = false
    ): Promise<Vacancy[]> {
        const response: Vacancy[] = [];
        let result: QueryResult<any> | undefined;

        try {
            let query: string = "SELECT * FROM vacancy WHERE selectiveProcessId = $1";
            const values: any[] = [processId];

            if (!showDeleted) query += " AND deleted = false";

            result = await db.query(query, values);

            if (result.rowCount > 0) {
                result.rows.forEach(row => {
                    response.push({
                        id: row.id,
                        selectiveProcessId: row.selectiveProcessId,
                        researchLineId: row.researchLineId,
                        broadCompetition: row.broadCompetition,
                        ppi: row.ppi,
                        pcd: row.pcd,
                        humanitaryPolitics: row.humanitaryPolitics,
                        modality: row.modality,
                        targetPublic: row.targetPublic,
                        period: row.timePeriod,
                        deleted: row.deleted
                    });
                });
            }
        } catch (err) {
            throw err;
        }

        return response;
    }

}