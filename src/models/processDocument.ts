import AccountingType from "../enums/accountingType";
import Modality from "../enums/modality";
import Stages from "../enums/stages";
import VacancyType from "../enums/vacancyType";

export default interface ProcessDocument {
    id: number;
    processId: number;
    name: string;
    description: string;
    stage: Stages;
    modality: Modality;
    vacancyType: VacancyType;
    accountingType: AccountingType;
    accountingValue: number;
    evaluated: boolean;
    allowMultipleSubmissions: boolean;
    deleted: boolean;
}