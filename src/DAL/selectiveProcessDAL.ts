import db from '../config/database';
import SelectiveProcess from '../models/selectiveProcess';

export default class selectiveProcessDAL {

    public static async createSelectiveProcess(selectiveProcess: SelectiveProcess): Promise<void> {
        const { name, startDate, endDate, homologationDate, applicationLimitDate, divulgationDate, createdBy } = selectiveProcess;

        try {
            await db.query(
                "INSERT INTO selectiveProcessess (name, startDate, endDate, homologationDate, status, applicationLimitDate, divulgationDate, active, deleted, createdBy) " +
                "VALUES ($1, $2, $3, $4, 'draft', $5, $6, true, false, $7)",
                [name, startDate, endDate, homologationDate, applicationLimitDate, divulgationDate, createdBy]
            );
        } catch (err) {
            throw err;
        }

    }

}