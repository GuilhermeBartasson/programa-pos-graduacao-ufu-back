import Stages from "../enums/stages";
import SubscriptionFormFieldDataType from "../enums/subscriptionFormFieldDataType";

export default interface SubscriptionFormField {
    name: string;
    description: string;
    dataType: SubscriptionFormFieldDataType;
    options?: string[];
    position: number;
    stage: Stages;
}