import { PoolClient, QueryResult } from 'pg';
import db from '../config/database';
import SelectiveProcessDates from '../models/selectiveProcessDates';

export default class selectiveProcessDAL {

    public static async createSelectiveProcess(
        name: string, collegeId: number, dates: SelectiveProcessDates, createdBy: number, client?: PoolClient
    ): Promise<QueryResult<any> | undefined> {
        let result: QueryResult<any> | undefined = undefined;

        try {
            const query: string = "INSERT INTO selectiveProcesses (name, collegeId, startDate, endDate, homologationDate, status, applicationLimitDate, divulgationDate, active, deleted, createdBy) " +
                "VALUES ($1, $2, $3, $4, $5, 'draft', $6, $7, true, false, $8) RETURNING id";

            const values: any[] = [name, collegeId, dates.startDate, dates.endDate, dates.homologationDate, dates.subscriptionEndDate, dates.divulgationDate, createdBy];

            if (client === undefined) result = await db.query(query, values);
            else result = await client.query(query, values);
        } catch (err) {
            throw err;
        }

        return result;
    }

}