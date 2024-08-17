import ResearchLineVacancy from "./researchLineVacancy";
import Vacancy from "./vacancy";

export default interface ResearchLineMastersVacancy extends ResearchLineVacancy {
    regularVacancy: Vacancy;
    specialVacancy: Vacancy;
}