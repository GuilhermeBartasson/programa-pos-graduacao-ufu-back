import { PoolClient, QueryResult } from 'pg';
import db from '../config/database';
import SubscriptionFormField from '../models/subscriptionFormField';
import SubscriptionFormFieldDataType from '../enums/subscriptionFormFieldDataType';
import SubscriptionFormFieldOption from '../models/subscriptionFormFieldOption';
import SubscriptionFormFieldDateOptions from '../models/subscriptionFormFieldDateOptions';
import SubscriptionFormFieldNumbeOptions from '../models/subscriptionFormFieldNumberOptions';
import SubscriptionFormFieldAnswer from '../models/subscriptionFormFieldAnswer';

export default class SubscriptionFormFieldDAL {

    //#region Create
    public static async createSubscriptionFormField(
        processId: number, formField: SubscriptionFormField, client?: PoolClient
    ): Promise<QueryResult<any> | undefined> {
        let result: QueryResult<any> | undefined;
        let { name, description, stage, dataType, position, required } = formField;

        try {
            const query: string =   "INSERT INTO subscriptionFormFields (selectiveProcessId, name, description, formPosition, stage, dataType, deleted, required) " +
                                    "VALUES ($1, $2, $3, $4, $5, $6, false, $7) RETURNING id"
            const values: any[] = [processId, name, description, position, stage, dataType, required];

            if (client === undefined) result = await db.query(query, values);
            else result = await client.query(query, values);

            let formFieldId = result.rows[0].id;

            if (formField.options !== undefined) {
                for (let option of formField.options) {
                    await this.createSubscriptionFormFieldOption(formFieldId, option, client);
                }
            }

            if (formField.dateOptions !== undefined) {
                await this.createSubscriptionFormFieldDateOptions(formFieldId, formField.dateOptions, client);
            }

            if (formField.numberOptions !== undefined) {
                await this.createSubscriptionFormFieldNumberOptions(formFieldId, formField.numberOptions, client);
            }
        } catch (err) {
            throw err;
        }

        return result;
    }

    public static async createSubscriptionFormFieldOption(
        subscriptionFormFieldId: number, option: SubscriptionFormFieldOption, client?: PoolClient
    ): Promise<QueryResult<any> | undefined> {
        let result: QueryResult<any> | undefined;

        try {
            const query: string =   "INSERT INTO subscriptionFormFieldOptions (subscriptionFormFieldId, optionName, deleted) " +
                                    "VALUES ($1, $2, false)";
            const values: any[] = [subscriptionFormFieldId, option.option];

            if (client === undefined) result = await db.query(query, values);
            else result = await client.query(query, values);
        } catch (err) {
            throw err;
        }

        return result;
    }

    public static async createSubscriptionFormFieldDateOptions(
        subscriptionFormFieldId: number, dateOptions: SubscriptionFormFieldDateOptions, client?: PoolClient
    ): Promise<QueryResult<any> | undefined> {
        let result: QueryResult<any> | undefined;
        const { max, maxEnabled, min, minEnabled } = dateOptions;

        try {
            const query: string =   "INSERT INTO subscriptionFormFieldDateOptions (subscriptionFormFieldId, max, maxEnabled, min, minEnabled) " +
                                    "VALUES ($1, $2, $3, $4, $5)";
            const values: any[] = [subscriptionFormFieldId, max === '' ? null : max, maxEnabled, min === '' ? null : min, minEnabled];

            if (client === undefined) result = await db.query(query, values);
            else result = await client.query(query, values);
        } catch (err) {
            throw err;
        }

        return result;
    }

    public static async createSubscriptionFormFieldNumberOptions(
        subscriptionFormFieldId: number, numberOptions: SubscriptionFormFieldNumbeOptions, client?: PoolClient
    ): Promise<QueryResult<any> | undefined> {
        let result: QueryResult<any> | undefined;
        const { max, maxEnabled, min, minEnabled } = numberOptions;

        try {
            const query: string =   'INSERT INTO subscriptionFormFieldNumberOptions (subscriptionFormFieldId, max, maxEnabled, min, minEnabled) ' +
                                    'VALUES ($1, $2, $3, $4, $5)';
            const values: any[] = [subscriptionFormFieldId, max, maxEnabled, min, minEnabled];

            if (client === undefined) result = await db.query(query, values);
            else result = await client.query(query, values);
        } catch (err) {
            throw err;
        }

        return result;
    }

    public static async createFormFieldAnswer(
        subscriptionId: number, formFieldAnswer: SubscriptionFormFieldAnswer, client?: PoolClient
    ): Promise<QueryResult<any> | undefined> {
        let result: QueryResult<any> | undefined;
        const { id, selectiveProcessId } = formFieldAnswer.formField!

        try {
            const query: string =   'INSERT INTO subscriptionFormFieldAnswers (processId, subscriptionFormFieldId, subscriptionId, answer, creationDate) ' +
                                    'VALUES ($1, $2, $3, $4, (Now())::timestamp)';
            const values: any[] = [selectiveProcessId, id, subscriptionId, formFieldAnswer.answer];

            if (client === undefined) result = await db.query(query, values)
            else result = await client.query(query, values);
        } catch (err) {
            throw err;
        }

        return result;
    }
    //#endregion Create

    //#region Get
    public static async getSubscriptionFormFieldsByProcessId(processId: number, showDeleted: boolean = false): Promise<SubscriptionFormField[]> {
        let response: SubscriptionFormField[] = [];
        let result: QueryResult<any> | undefined;

        try {
            let query: string = "SELECT * FROM subscriptionFormFields WHERE selectiveProcessId = $1";
            const values: any[] = [processId];

            if (!showDeleted) query += " AND deleted = false";

            result = await db.query(query, values);

            if (result.rowCount > 0) {
                for (const row of result.rows) {
                    let subscriptionFormField = await this.assembleSubscriptionFormField(row);
                    response.push(subscriptionFormField);
                };
            }
        } catch (err) {
            throw err;
        }

        return response;
    }

    public static async getSubscriptionFormFieldById(id: number, showDeleted: boolean = false): Promise<SubscriptionFormField | undefined> {
        let response: SubscriptionFormField | undefined;
        let result: QueryResult<any> | undefined;

        try {
            let query: string = "SELECT * FROM subscriptionFormFields WHERE id = $1";
            const values: any[] = [id];

            if (!showDeleted) query += " AND deleted = false";

            result = await db.query(query, values);

            if (result.rowCount > 0) {
                response = await this.assembleSubscriptionFormField(result.rows[0]);
            }
        } catch (err) {
            throw err;
        }

        return response;
    }

    private static async assembleSubscriptionFormField(row: any): Promise<SubscriptionFormField> {
        let subscriptionFormField: SubscriptionFormField = {
            id: row.id,
            selectiveProcessId: row.selectiveprocessid,
            name: row.name,
            description: row.description,
            position: row.formposition,
            stage: row.stage,
            deleted: row.deleted,
            dataType: row.datatype,
            required: row.required
        }

        if ([SubscriptionFormFieldDataType.checkbox, SubscriptionFormFieldDataType.select].includes(row.datatype)) {
            subscriptionFormField.options = await this.getSubscriptionFormFieldOptionsByFormFieldId(row.id);
        }

        if ([SubscriptionFormFieldDataType.date].includes(row.datatype)) {
            subscriptionFormField.dateOptions = await this.getSubscriptionFormFieldDateOptionsByFormFieldId(row.id);
        }

        if ([SubscriptionFormFieldDataType.number].includes(row.datatype)) {
            subscriptionFormField.numberOptions = await this.getSubscriptionFormFieldNumberOptionsByFormFieldId(row.id);
        }

        return subscriptionFormField;
    }

    public static async getSubscriptionFormFieldOptionsByFormFieldId(formFieldId: number, showDeleted: boolean = false): Promise<SubscriptionFormFieldOption[]> {
        const response: SubscriptionFormFieldOption[] = [];
        let result: QueryResult<any> | undefined;

        try {
            let query: string = "SELECT * FROM subscriptionFormFieldOptions WHERE subscriptionFormFieldId = $1";
            const values: any[] = [formFieldId];

            if (!showDeleted) query += " AND deleted = false";

            result = await db.query(query, values);

            if (result.rowCount > 0) {
                result.rows.forEach(row => {
                    response.push({
                        id: row.id,
                        subscriptionFormFieldId: row.subscriptionformfieldid,
                        option: row.optionname,
                        deleted: row.deleted
                    });
                });
            }
        } catch (err) {
            throw err;
        }

        return response;
    }

    public static async getSubscriptionFormFieldDateOptionsByFormFieldId(formFieldId: number): Promise<SubscriptionFormFieldDateOptions | undefined> {
        let response: SubscriptionFormFieldDateOptions | undefined;
        let result: QueryResult<any> | undefined;

        try {
            const query: string = "SELECT * FROM subscriptionFormFieldDateOptions WHERE subscriptionFormFieldId = $1";
            const values: any[] = [formFieldId];

            result = await db.query(query, values);

            if (result.rowCount > 0) {
                response = {
                    max: result.rows[0].max,
                    maxEnabled: result.rows[0].maxenabled,
                    min: result.rows[0].min,
                    minEnabled: result.rows[0].minenabled,
                }
            }
        } catch (err) {
            throw err;
        }

        return response;
    }

    public static async getSubscriptionFormFieldNumberOptionsByFormFieldId(formFieldId: number): Promise<SubscriptionFormFieldNumbeOptions | undefined> {
        let response: SubscriptionFormFieldNumbeOptions | undefined;
        let result: QueryResult<any> | undefined;

        try {
            const query: string = 'SELECT * FROM subscriptionFormFieldNumberOptions WHERE subscriptionFormFieldId = $1';
            const values: any[] = [formFieldId];

            result = await db.query(query, values);

            if (result.rowCount > 0) {
                response = {
                    max: result.rows[0].max,
                    maxEnabled: result.rows[0].maxenabled,
                    min: result.rows[0].min,
                    minEnabled: result.rows[0].minenabled,
                }
            }
        } catch (err) {
            throw err;
        }

        return response;
    }

    public static async getSubscriptionFormFieldAnswerBySubscriptionId(subscriptionId: number): Promise<SubscriptionFormFieldAnswer | undefined> {
        let response: SubscriptionFormFieldAnswer | undefined;
        let result: QueryResult<any> | undefined;

        try {
            const query: string = 'SELECT * FROM subscriptionFormFieldAnswers WHERE subscriptionId = $1';
            const values: any[] = [subscriptionId];

            result = await db.query(query, values);

            if (result.rowCount > 0) {
                let row = result.rows[0];

                response = {
                    id: row.id,
                    answer: row.answer
                }

                response.formField = await this.getSubscriptionFormFieldById(row.subscriptionformfieldid);
            }
        } catch (err) {
            throw err;
        }

         return response;
    }
    //#endregion Get

    //#region Delete
    public static async deleteSubscriptionFormFieldsByProcessId(processId: number, client?: PoolClient): Promise<void> {
        try {
            const formFields: SubscriptionFormField[] = await this.getSubscriptionFormFieldsByProcessId(processId, true);

            await Promise.all(formFields.map(async (formField: SubscriptionFormField) => {
                await this.deleteSubscriptionFormFieldOptionByFormFieldId(formField.id, client);
                await this.deleteSubscriptionFormFieldDateOptionsByFormFieldId(formField.id, client);
                await this.deleteSubscriptionFormFieldNumberOptionsByFormFieldId(formField.id, client)
            }));

            const query: string = 'DELETE FROM subscriptionFormFields WHERE selectiveProcessId = $1';
            const values: any[] = [processId];

            if (client === undefined) db.query(query, values);
            else client.query(query, values);
        } catch (err) {
            throw err;
        }
    }

    public static async deleteSubscriptionFormFieldOptionByFormFieldId(formFieldId?: number, client?: PoolClient): Promise<void> {
        if (formFieldId !== undefined) {
            try {
                const query: string = 'DELETE FROM subscriptionFormFieldOptions WHERE subscriptionFormFieldId = $1';
                const values: any[] = [formFieldId];

                if (client === undefined) db.query(query, values);
                else client.query(query, values);
            } catch (err) {
                throw err;
            }
        }
    }

    public static async deleteSubscriptionFormFieldDateOptionsByFormFieldId(formFieldId?: number, client?: PoolClient): Promise<void> {
        if (formFieldId !== undefined) {
            try {
                const query: string = 'DELETE FROM subscriptionFormFieldDateOptions WHERE subscriptionFormFieldId = $1';
                const values: any[] = [formFieldId];

                if (client === undefined) db.query(query, values);
                else client.query(query, values);
            } catch (err) {
                throw err;
            }
        }
    }

    public static async deleteSubscriptionFormFieldNumberOptionsByFormFieldId(formFieldId?: number, client?: PoolClient): Promise<void> {
        if (formFieldId !== undefined) {
            try {
                const query: string = 'DELETE FROM subscriptionFormFieldNumberOptions WHERE subscriptionFormFieldId = $1';
                const values: any[] = [formFieldId];

                if (client === undefined) db.query(query, values);
                else client.query(query, values);
            } catch (err) {
                throw err;
            }
        }
    }

    public static async deleteSubscriptionFormFieldAnswersBySubscriptionId(subscriptionId: number, client?: PoolClient): Promise<void> {
        try {
            const query: string = 'DELETE FROM subscriptionFormFieldAnswers WHERE subscriptionId = $1';
            const values: any[] = [subscriptionId];

            if (client === undefined) db.query(query, values);
            else client.query(query, values);
        } catch (err) {
            throw err;
        }
    }
    //#endregion Delete

}