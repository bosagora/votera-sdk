import { ClientCore, Context } from "../../client-common";
import { IAssessmentMethods } from "../../interface/IAssessment";
import { NoSignerError } from "votera-sdk-common";

export class AssessmentMethods extends ClientCore implements IAssessmentMethods {
    constructor(context: Context) {
        super(context);
        Object.freeze(AssessmentMethods.prototype);
        Object.freeze(this);
    }

    public async getAccount(): Promise<string> {
        const signer = this.web3.getConnectedSigner();
        if (!signer) throw new NoSignerError();
        return await signer.getAddress();
    }
}
