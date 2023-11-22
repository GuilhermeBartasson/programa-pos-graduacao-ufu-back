import Teacher from "./teacher";

export default interface ResearchLine {
    id?: number;
    name: string;
    collegeId: number;
    teachers?: Teacher[];
    active?: boolean;
    deleted?: boolean;
}