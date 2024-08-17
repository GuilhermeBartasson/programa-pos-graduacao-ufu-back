import db from '../config/database';
import SelectiveProcess from '../models/selectiveProcess';
import SelectiveProcessDates from '../models/selectiveProcessDates';

export default class selectiveProcessDAL {

    public static async createSelectiveProcess(
        name: string, collegeId: number, dates: SelectiveProcessDates, createdBy: number
    ): Promise<void> {
        try {
            await db.query(
                "INSERT INTO selectiveProcessess (name, collegeId, startDate, endDate, homologationDate, status, applicationLimitDate, divulgationDate, active, deleted, createdBy) " +
                "VALUES ($1, $2, $3, $4, $5, 'draft', $6, $7, true, false, $8)",
                [name, collegeId, dates.startDate, dates.endDate, dates.homologationDate, dates.subscriptionEndDate, dates.divulgationDate, createdBy]
            );
        } catch (err) {
            throw err;
        }
    }

}