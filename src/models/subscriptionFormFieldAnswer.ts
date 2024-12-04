import SubscriptionFormField from "./subscriptionFormField";

export default interface SubscriptionFormFieldAnswer {
    id: number;
    answer: any;
    formField?: SubscriptionFormField
}
