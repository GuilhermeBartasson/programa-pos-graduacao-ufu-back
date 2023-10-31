import Teacher from "./teacher";

export default interface ResearchLine {
    id?: number;
    name: string;
    teachers?: Teacher[];
    active?: boolean;
    deleted?: boolean;
}