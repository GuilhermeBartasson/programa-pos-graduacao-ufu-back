import Modality from "../enums/modality";
import TargetPublic from "../enums/targetPublic";

export default interface Vacancy {
    id?: number;
    selectiveProcessId: number;
    researchLineId: number;
    broadCompetition: number;
    ppi: number;
    pcd: number;
    humanitaryPolitics: number;
    modality: Modality;
    targetPublic: TargetPublic;
    period?: string;
    deleted: boolean;
}