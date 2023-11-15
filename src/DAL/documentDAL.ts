import db from '../config/database';
import Document from '../models/document';

export default class DocumentDAL {

    public static async createDocument(document: Document): Promise<void> {
        const { processId, name, accountingType, stage } = document;

        try {
            await db.query(
                'INSERT INTO doucuments (processId, name, accountingType, stage, deleted) VALUES ($1, $2, $3, $4, FALSE)',
                [processId, name, accountingType, stage]
            )
        } catch (err) {
            throw err;
        }
    }

}