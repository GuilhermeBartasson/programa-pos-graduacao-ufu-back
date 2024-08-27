import { PoolClient, QueryResult } from 'pg';
import db from '../config/database';
import SelectiveProcessDates from '../models/selectiveProcessDates';
import SelectiveProcess from '../models/selectiveProcess';

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

    public static async getSelectiveProcessesByCollegeId(collegeId: number, showDeleted: boolean = false): Promise<SelectiveProcess[]> {
        let result: QueryResult<any> | undefined;
        const selectiveProcesses: SelectiveProcess[] = [];

        try {
            let query: string = "SELECT * FROM selectiveProcesses WHERE collegeId = $1";
            const values: any[] = [collegeId];

            if (!showDeleted) query += " AND deleted = false";

            result = await db.query(query, values);

            if (result.rowCount > 0) {
                result.rows.forEach(row => {
                    selectiveProcesses.push({
                        id: row.id,
                        name: row.name,
                        dates: {
                            startDate: row.startDate,
                            endDate: row.endDate,
                            homologationDate: row.homologationDate,
                            subscriptionEndDate: row.applicationLimitDate,
                            divulgationDate: row.DivulgationDate
                        },
                        collegeId: row.collegeId,
                        active: row.active,
                        status: row.status,
                        deleted: row.deleted,
                        createdBy: row.createdBy
                    });
                });
            }
        } catch (err) {
            throw err;
        }

        return selectiveProcesses;
    }

    public static async getSelectiveProcessById(processId: number): Promise<SelectiveProcess | undefined> {
        let result: QueryResult<any> | undefined;
        let selectiveProcess: SelectiveProcess | undefined;

        try {
            const query: string = "SELECT * FROM selectiveProcesses WHERE id = $1";
            const values: any[] = [processId];

            result = await db.query(query, values);

            if (result.rowCount > 0) {
                let row: any = result.rows[0];

                selectiveProcess = {
                    id: row.id,
                        name: row.name,
                        dates: {
                            startDate: row.startDate,
                            endDate: row.endDate,
                            homologationDate: row.homologationDate,
                            subscriptionEndDate: row.applicationLimitDate,
                            divulgationDate: row.DivulgationDate
                        },
                        collegeId: row.collegeId,
                        active: row.active,
                        status: row.status,
                        deleted: row.deleted,
                        createdBy: row.createdBy
                }
            }
        } catch (err) {
            throw err;
        }

        return selectiveProcess
    }

}