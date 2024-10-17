import { IClientCore } from "../client-common";

export interface IAssessment {
    assessment: IAssessmentMethods;
}

export interface IAssessmentMethods extends IClientCore {
    getAccount: () => Promise<string>;
}
