import db from '../config/database';
import ProcessDocument from '../models/processDocument';

export default class DocumentDAL {

    public static async createDocument(document: ProcessDocument): Promise<void> {
        const { 
            processId, 
            name, 
            description, 
            modality, 
            vacancyType, 
            accountingType, 
            accountingValue,
            evaluated,
            allowMultipleSubmissions, 
            stage 
        } = document;

        try {
            await db.query(
                'INSERT INTO doucuments (' +
                    'processId, ' +
                    'name, ' +
                    'description, ' +
                    'modality, ' +
                    'vacancyType, ' +
                    'accountingType, ' +
                    'accountingValue, ' +
                    'evaluated, ' +
                    'allowMultipleSubmissions, ' +
                    'stage, ' +
                    'deleted' +
                ') VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, FALSE)',
                [processId, name, description, modality, vacancyType, accountingType, accountingValue, evaluated, allowMultipleSubmissions, stage]
            )
        } catch (err) {
            throw err;
        }
    }

}