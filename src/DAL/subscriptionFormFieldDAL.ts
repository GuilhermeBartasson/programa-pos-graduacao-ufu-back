import { PoolClient, QueryResult } from 'pg';
import db from '../config/database';
import SubscriptionFormField from '../models/subscriptionFormField';

export default class SubscriptionFormFieldDAL {

    public static async createSubscriptionFormField(
        processId: number, formField: SubscriptionFormField, client?: PoolClient
    ): Promise<QueryResult<any> | undefined> {
        let result: QueryResult<any> | undefined;

        try {
            const query: string =   "INSERT INTO subscriptionFormFields (selectiveProcessId, name, description, formPosition, stage, dataType, deleted) " +
                                    "VALUES ($1, $2, $3, $4, $5, $6, false)"
            const values: any[] = [processId, formField.name, formField.description, formField.stage, formField.dataType];

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
        subscriptionFormFieldId: number, option: string, client?: PoolClient
    ): Promise<QueryResult<any> | undefined> {
        let result: QueryResult<any> | undefined;

        try {
            const query: string =   "INSERT INTO subscriptionFormFieldOptions (subscriptionFormFieldId, optionName, deleted)" +
                                    "VALUES ($1, $2, false)";
            const values: any[] = [subscriptionFormFieldId, option];

            if (client === undefined) result = await db.query(query, values);
            else result = await client.query(query, values);
        } catch (err) {
            throw err;
        }

        return result;
    }

}