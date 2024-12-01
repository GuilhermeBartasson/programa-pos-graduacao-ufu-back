import { PoolClient, QueryResult } from "pg";
import db from '../config/database';
import ProcessDocument from "../models/processDocument";

export default class ProcessDocumentDAL {

    public static async createProcessDocument(
        processId: number, document: ProcessDocument, client?: PoolClient
    ): Promise<QueryResult<any> | undefined> {
        let result: QueryResult<any> | undefined;
        let { name, description, stage, modality, vacancyType, accountingType, accountingValue, evaluated, allowMultipleSubmissions, maxEvaluation, maxEvaluationEnabled, required } = document;

        try {
            const query: string = "INSERT INTO processDocument (processId, name, description, stage, modality, vacancyType, accountingType, accountingValue, evaluated, allowMultipleSubmissions, maxEvaluation, maxEvaluationEnabled, required) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)";
            const values: any[] = [processId, name, description, stage, modality, vacancyType, accountingType, accountingValue, evaluated, allowMultipleSubmissions, maxEvaluation, maxEvaluationEnabled, required];

            if (client === undefined) result = await db.query(query, values);
            else result = await client.query(query, values);
        } catch (err) {
            throw err;
        }

        return result;
    }

    public static async deleteDocumentsByProcessId(processId: number, client?: PoolClient): Promise<void> {
        try {
            const query: string = 'DELETE FROM processDocument WHERE processId = $1';
            const values: any[] = [processId];

            if (client === undefined) await db.query(query, values);
            else client.query(query, values);
        } catch (err) {
            throw err;
        }
    }

    public static async getDocumentsByProcessId(processId: number, client?: PoolClient): Promise<ProcessDocument[]> {
        let response: ProcessDocument[] = [];
        let result: QueryResult<any> | undefined;

        try {
            const query: string = 'SELECT * FROM processDocument WHERE processId = $1';
            const values: any[] = [processId];

            if (client === undefined) result = await db.query(query, values);
            else result = await client.query(query, values);

            if (result.rowCount > 0) {
                result.rows.forEach((row: any) => {
                    response.push({
                        id: row.id,
                        processId: processId,
                        name: row.name,
                        description: row.description,
                        stage: row.stage,
                        modality: row.modality,
                        vacancyType: row.vacancytype,
                        accountingType: row.accountingtype,
                        accountingValue: row.accountingvalue,
                        evaluated: row.evaluated,
                        allowMultipleSubmissions: row.allowmultiplesubmissions,
                        maxEvaluation: row.maxevaluation,
                        maxEvaluationEnabled: row.maxevaluationenabled,
                        deleted: row.deleted,
                        required: row.required
                    });
                });
            }
        } catch (err) {
            throw err;
        }

        return response;
    }

}