import DoctorateVacancy from "./doctorateVacancy";
import ResearchLineVacancy from "./researchLineVacancy";

export default interface ResearchLineDoctorateVacancy extends ResearchLineVacancy {
    vacancyPeriods: DoctorateVacancy[];
}