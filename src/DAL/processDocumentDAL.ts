import { PoolClient, QueryResult } from "pg";
import db from '../config/database';
import ProcessDocument from "../models/processDocument";

export default class ProcessDocumentDAL {

    public static async createProcessDocumentDAL(
        processId: number, document: ProcessDocument, client?: PoolClient
    ): Promise<QueryResult<any> | undefined> {
        let result: QueryResult<any> | undefined;

        try {
            const query: string = "INSERT INTO processDocument (processId, name, description, stage, modality, vacancyType, accountingType, accountingValue, evaluated, allowMultipleSubmissions)";
            const values: any[] = [processId, document.name, document.description, document.stage, document.modality, document.vacancyType, document.accountingType, document.accountingValue, document.evaluated, document.allowMultipleSubmissions];

            if (client === undefined) result = await db.query(query, values);
            else result = await client.query(query, values);
        } catch (err) {
            throw err;
        }

        return result;
    }

}