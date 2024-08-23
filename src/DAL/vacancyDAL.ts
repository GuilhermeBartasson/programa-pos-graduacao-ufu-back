import { PoolClient, QueryResult } from 'pg';
import db from '../config/database';
import Vacancy from '../models/vacancy';
import Modality from '../enums/modality';
import TargetPublic from '../enums/targetPublic';

export default class VacancyDAL {

    public static async createVacancy(
        vacancy: Vacancy, modality: Modality, targetPublic: TargetPublic, processId: number, researchLineId: number, period?: string, client?: PoolClient
    ): Promise<QueryResult<any> | undefined> {
        let result: QueryResult<any> | undefined;

        try {
            const query: string =   "INSERT INTO vacancy (selectiveProcessId, researchLineId, broadCompetition, ppi, pcd, humanitaryPolitics, modality, targetPublic, timePeriod, deleted) " +
                                    "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, false)"
            const values: any[] = [processId, researchLineId, vacancy.broadCompetition, vacancy.ppi, vacancy.pcd, vacancy.humanitaryPolitics, modality, targetPublic, period];

            if (client === undefined) result = await db.query(query, values);
            else result = await client.query(query, values)
        } catch (err) {
            throw err;
        }

        return result;
    }

}