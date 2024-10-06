import { PoolClient, QueryResult } from 'pg';
import db from '../config/database';
import SubscriptionFormField from '../models/subscriptionFormField';
import SubscriptionFormFieldDataType from '../enums/subscriptionFormFieldDataType';
import SubscriptionFormFieldOption from '../models/subscriptionFormFieldOption';

export default class SubscriptionFormFieldDAL {

    public static async createSubscriptionFormField(
        processId: number, formField: SubscriptionFormField, client?: PoolClient
    ): Promise<QueryResult<any> | undefined> {
        let result: QueryResult<any> | undefined;
        let { name, description, stage, dataType, position } = formField;

        try {
            const query: string =   "INSERT INTO subscriptionFormFields (selectiveProcessId, name, description, formPosition, stage, dataType, deleted) " +
                                    "VALUES ($1, $2, $3, $4, $5, $6, false) RETURNING id"
            const values: any[] = [processId, name, description, position, stage, dataType];

            if (client === undefined) result = await db.query(query, values);
            else result = await client.query(query, values);

            let formFieldId = result.rows[0].id;

            if (formField.options !== undefined) {
                formField.options.forEach(async (option) => {
                    await this.createSubscriptionFormFieldOption(formFieldId, option, client);
                });
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

    public static async getSubscriptionFormFieldsByProcessId(processId: number, showDeleted: boolean = false): Promise<SubscriptionFormField[]> {
        let response: SubscriptionFormField[] = [];
        let result: QueryResult<any> | undefined;

        try {
            let query: string = "SELECT * FROM subscriptionFormFields WHERE selectiveProcessId = $1";
            const values: any[] = [processId];

            if (!showDeleted) query += " AND deleted = false";

            result = await db.query(query, values);

            if (result.rowCount > 0) {
                result.rows.forEach(async (row: any) => {
                    let subscriptionFormField: SubscriptionFormField = {
                        id: row.id,
                        selectiveProcessId: row.selectiveprocessid,
                        name: row.name,
                        description: row.description,
                        position: row.formposition,
                        stage: row.stage,
                        deleted: row.deleted,
                        dataType: row.datatype
                    }

                    if ([SubscriptionFormFieldDataType.checkbox, SubscriptionFormFieldDataType.select].includes(row.dataType)) {
                        subscriptionFormField.options = await this.getSubscriptionFormFieldOptionsByFormFieldId(row.id);
                    }

                    response.push(subscriptionFormField);
                });
            }
        } catch (err) {
            throw err;
        }

        return response;
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

    public static async deleteSubscriptionFormFieldsByProcessId(processId: number, client?: PoolClient): Promise<void> {
        try {
            const formFields: SubscriptionFormField[] = await this.getSubscriptionFormFieldsByProcessId(processId, true);

            await Promise.all(formFields.map(async (formField: SubscriptionFormField) => {
                await this.deleteSubscriptionFormFieldOptionByFormFieldId(formField.id, client);
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

}