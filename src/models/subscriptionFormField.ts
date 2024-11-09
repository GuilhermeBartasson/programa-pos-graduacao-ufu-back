import Stages from "../enums/stages";
import SubscriptionFormFieldDataType from "../enums/subscriptionFormFieldDataType";
import SubscriptionFormFieldOption from "./subscriptionFormFieldOption";

export default interface SubscriptionFormField {
    id?: number;
    selectiveProcessId: number;
    name: string;
    description: string;
    dataType: SubscriptionFormFieldDataType;
    options?: SubscriptionFormFieldOption[];
    position: number;
    stage: Stages;
    deleted: boolean;
    required: boolean;
}