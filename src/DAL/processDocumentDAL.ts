import { PoolClient, QueryResult } from "pg";
import db from '../config/database';
import ProcessDocument from "../models/processDocument";
import ProcessDocumentSubmission from "../models/processDocumentSubmission";
import { EvaluatedDocumentSubmission, EvaluatedFileSubmission } from "../models/evaluatedDocumentSubmission";

export default class ProcessDocumentDAL {

    public static async createProcessDocument(
        processId: number, document: ProcessDocument, client?: PoolClient
    ): Promise<QueryResult<any> | undefined> {
        let result: QueryResult<any> | undefined;
        let { name, description, stage, modality, vacancyType, accountingType, accountingValue, evaluated, allowMultipleSubmissions, maxEvaluation, maxEvaluationEnabled, required } = document;

        try {
            const query: string = 'INSERT INTO processDocument (processId, name, description, stage, modality, vacancyType, accountingType, accountingValue, evaluated, allowMultipleSubmissions, "maxEvaluation", "maxEvaluationEnabled", required) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)';
            const values: any[] = [processId, name, description, stage, modality, vacancyType, accountingType, accountingValue, evaluated, allowMultipleSubmissions, maxEvaluation, maxEvaluationEnabled, required];

            if (client === undefined) result = await db.query(query, values);
            else result = await client.query(query, values);
        } catch (err) {
            throw err;
        }

        return result;
    }

    public static async createProcessDocumentSubsmission(
        processId: number, subscriptionId: number, documentSubmission: ProcessDocumentSubmission, client?: PoolClient
    ): Promise<QueryResult<any> | undefined> {
        let result: QueryResult<any> | undefined;
        const { id } = documentSubmission.processDocument;

        try {
            const query: string = 'INSERT INTO processDocumentAnswers (processId, processDocumentId, subscriptionId, creationDate) VALUES ($1, $2, $3, (Now())::timestamp)';
            const values: any[] = [processId, id, subscriptionId];

            if (client === undefined) result = await db.query(query, values);
            else client.query(query, values);
        } catch (err) {
            throw err;
        }

        return result;
    }

    public static async createProcessDocumentEvaluatedSubmission(
        processId: number, subscriptionId: number, evaluatedDocumentSubmission: EvaluatedDocumentSubmission, client?: PoolClient
    ): Promise<QueryResult<any> | undefined> {
        let result: QueryResult<any> | undefined;
        const { id } = evaluatedDocumentSubmission.processDocument;

        try {
            const query: string =   'INSERT INTO processEvaluatedDocumentAnswers (processId, processDocumentId, subscriptionId, submittedFileNumber, submittedFileAllegedCount, submittedFileAllegedStartDate, submittedFileAllegedEndDate, creationDate) ' +
                                    'VALUES($1, $2, $3, $4, $5, $6, $7, (Now())::timestamp)';

            evaluatedDocumentSubmission.submitedFiles?.forEach(async (evaluatedSubmission: EvaluatedFileSubmission, index: number) => {
                let fileNumber: number = index + 1;
                let { accounting, startDate, endDate } = evaluatedSubmission

                let values: any[] = [processId, id, subscriptionId, fileNumber, accounting, startDate, endDate];

                if (client === undefined) result = await db.query(query, values);
                else result = await client.query(query, values);
            });
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
            else await client.query(query, values);
        } catch (err) {
            throw err;
        }
    }

    public static async deleteProcessDocumentSubsmissionBySubscriptionId(subscriptionId: number, client?: PoolClient): Promise<void> {
        try {
            const query: string = 'DELETE FROM processDocumentAnswers WHERE subscriptionId = $1';
            const values: any[] = [subscriptionId];

            if (client === undefined) await db.query(query, values);
            else await client.query(query, values);
        } catch (err) {
            throw err;
        }
    }

    public static async deleteProcessDocumentEvaluatedSubmissionBySubscriptionId(subscriptionId: number, client?: PoolClient): Promise<void> {
        try {
            const query: string = 'DELETE FROM processEvaluatedDocumentAnswers WHERE subscriptionId = $1';
            const values: any[] = [subscriptionId];

            if (client === undefined) await db.query(query, values);
            else await client.query(query, values);
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
                    response.push(this.assembleProcessDocumentObject(row));
                });
            }
        } catch (err) {
            throw err;
        }

        return response;
    }

    public static async getDocumentById(id: number, client?: PoolClient): Promise<ProcessDocument | undefined> {
        let response: ProcessDocument | undefined;
        let result: QueryResult<any> | undefined;

        try {
            const query: string = 'SELECT * FROM processDocument WHERE id = $1';
            const values: any[] = [id];

            if (client === undefined) result = await db.query(query, values);
            else result = await client.query(query, values);

            if (result.rowCount > 0) {
                response = this.assembleProcessDocumentObject(result.rows[0]);
            }
        } catch (err) {
            throw err;
        }

        return response;
    }

    private static assembleProcessDocumentObject(row: any) {
        return {
            id: row.id,
            processId: row.processid,
            name: row.name,
            description: row.description,
            stage: row.stage,
            modality: row.modality,
            vacancyType: row.vacancytype,
            accountingType: row.accountingtype,
            accountingValue: row.accountingvalue,
            evaluated: row.evaluated,
            allowMultipleSubmissions: row.allowmultiplesubmissions,
            maxEvaluation: row.maxEvaluation,
            maxEvaluationEnabled: row.maxEvaluationEnabled,
            deleted: row.deleted,
            required: row.required
        }
    }

}