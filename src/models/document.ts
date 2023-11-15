export default interface Document {
    id: number;
    processId: number;
    name: string;
    accountingType: string;
    stage: string;
    deleted: boolean;
}