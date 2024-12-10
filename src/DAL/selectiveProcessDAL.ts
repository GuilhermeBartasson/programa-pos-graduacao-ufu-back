import { PoolClient, QueryResult } from 'pg';
import db from '../config/database';
import SelectiveProcessDates from '../models/selectiveProcessDates';
import SelectiveProcess from '../models/selectiveProcess';

export default class selectiveProcessDAL {

    public static async createSelectiveProcess(
        name: string, collegeId: number, createdBy: number, dates?: SelectiveProcessDates, client?: PoolClient
    ): Promise<QueryResult<any> | undefined> {
        let result: QueryResult<any> | undefined = undefined;

        try {
            const query: string = "INSERT INTO selectiveProcesses (name, collegeId, startDate, endDate, homologationDate, status, applicationLimitDate, divulgationDate, active, deleted, createdBy) " +
                "VALUES ($1, $2, $3, $4, $5, 'draft', $6, $7, true, false, $8) RETURNING id";

            const values: any[] = [
                name, 
                collegeId, 
                dates?.startDate || null, 
                dates?.endDate || null, 
                dates?.homologationDate || null, 
                dates?.subscriptionEndDate || null, 
                dates?.divulgationDate || null, 
                createdBy
            ];

            if (client === undefined) result = await db.query(query, values);
            else result = await client.query(query, values);
        } catch (err) {
            throw err;
        }

        return result;
    }

    public static async createSelectiveProcessSubscription(
        processId: number, userEmail: string, modality: string, vacancyType: string, targetPublic: string, researchLineId: number, client?: PoolClient
    ): Promise<QueryResult<any> | undefined> {
        let result: QueryResult<any> | undefined;

        try {
            const query: string = 'INSERT INTO selectiveProcessSubscriptions (processId, userEmail, modality, vacancyType, targetPublic, researchLineId) VALUES ($1, $2, $3, $4, $5, $6)';
            const values: any[] = [processId, userEmail, modality, vacancyType, targetPublic, researchLineId];

            if (client === undefined) result = await db.query(query, values);
            else result = await client.query(query, values);
        } catch (err) {
            throw err;
        }

        return result;
    }

    public static async getSelectiveProcessesCoverByCollegeId(collegeId: number, showDeleted: boolean = false): Promise<SelectiveProcess[]> {
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
                            startDate: row.startdate,
                            endDate: row.enddate,
                            homologationDate: row.homologationdate,
                            subscriptionEndDate: row.applicationlimitdate,
                            divulgationDate: row.divulgationdate
                        },
                        collegeId: row.collegeid,
                        active: row.active,
                        status: row.status,
                        deleted: row.deleted,
                        createdBy: row.createdby
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
                        startDate: row.startdate,
                        endDate: row.enddate,
                        homologationDate: row.homologationdate,
                        subscriptionEndDate: row.applicationlimitdate,
                        divulgationDate: row.divulgationdate
                    },
                    collegeId: row.collegeid,
                    active: row.active,
                    status: row.status,
                    deleted: row.deleted,
                    createdBy: row.createdby
                }
            }
        } catch (err) {
            throw err;
        }

        return selectiveProcess
    }

    public static async deleteSelectiveProcessById(processId: number, client?: PoolClient): Promise<void> {
        try {
            const query: string = 'DELETE FROM selectiveProcesses WHERE id = $1';
            const values: any[] = [processId];

            if (client === undefined) await db.query(query, values);
            else await client.query(query, values);
        } catch (err) {
            throw err;
        }
    }

    public static async deleteSelectiveProcessSubscriptionById(subscriptionId: number, client?: PoolClient): Promise<void> {
        try {
            const query: string = 'DELETE FROM selectiveProcessSubscriptions WHERE id = $1';
            const values: any[] = [subscriptionId];

            if (client === undefined) await db.query(query, values);
            else await client.query(query, values);
        } catch (err) {
            throw err;
        }
    }

    public static async saveSelectiveProcessCover(selectiveProcess: SelectiveProcess, client?: PoolClient): Promise<QueryResult<any> | undefined> {
        let result: QueryResult<any> | undefined;
        const { id, name, collegeId } = selectiveProcess;
        const { startDate, endDate, homologationDate, subscriptionEndDate, divulgationDate } = selectiveProcess.dates;

        try {
            const query = "UPDATE selectiveProcesses SET name = $1, collegeId = $2, startDate = $3, endDate = $4, homologationDate = $5, applicationLimitDate = $6, divulgationDate = $7 WHERE id = $8";
            const values: any = [name, collegeId, startDate, endDate, homologationDate, subscriptionEndDate, divulgationDate, id];

            if (client === undefined) result = await db.query(query, values);
            else result = await client.query(query, values);
        } catch (err) {
            throw err;
        }

        return result;
    }

    public static async updateSelectiveProcessSubscription(
        subscriptionId: number, modality: string, vacancyType: string, targetPublic: string, researchLineId: number, client?: PoolClient
    ): Promise<QueryResult<any> | undefined> {
        let result: QueryResult<any> | undefined;

        try {
            const query: string = 'UPDATE selectiveProcessSubscriptions SET modality = $1, vacancyType = $2, targetPublic = $3, researchLineId = $4 WHERE id = $5';
            const values: any[] = [modality, vacancyType, targetPublic, researchLineId, subscriptionId];

            if (client === undefined) result = await db.query(query, values);
            else result = await client.query(query, values);
        } catch (err) {
            throw err;
        }

        return result;
    }

}