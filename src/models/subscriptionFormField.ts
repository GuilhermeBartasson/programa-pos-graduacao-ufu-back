import Stages from "../enums/stages";
import SubscriptionFormFieldDataType from "../enums/subscriptionFormFieldDataType";
import SubscriptionFormFieldDateOptions from "./subscriptionFormFieldDateOptions";
import SubscriptionFormFieldOption from "./subscriptionFormFieldOption";

export default interface SubscriptionFormField {
    id?: number;
    selectiveProcessId: number;
    name: string;
    description: string;
    dataType: SubscriptionFormFieldDataType;
    options?: SubscriptionFormFieldOption[];
    dateOptions?: SubscriptionFormFieldDateOptions;
    position: number;
    stage: Stages;
    deleted: boolean;
    required: boolean;
}