import db from '../config/database';
import SelectiveProcess from '../models/selectiveProcess';

export default class selectiveProcessDAL {

    public static async createSelectiveProcess(selectiveProcess: SelectiveProcess): Promise<void> {
        const { name, collegeId, startDate, endDate, homologationDate, applicationLimitDate, divulgationDate, createdBy } = selectiveProcess;

        try {
            await db.query(
                "INSERT INTO selectiveProcessess (name, collegeId, startDate, endDate, homologationDate, status, applicationLimitDate, divulgationDate, active, deleted, createdBy) " +
                "VALUES ($1, $2, $3, $4, $5, 'draft', $6, $7, true, false, $8)",
                [name, collegeId, startDate, endDate, homologationDate, applicationLimitDate, divulgationDate, createdBy]
            );
        } catch (err) {
            throw err;
        }

    }

}