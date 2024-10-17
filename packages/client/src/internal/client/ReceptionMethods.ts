import { ClientCore, Context } from "../../client-common";
import { IReceptionMethods } from "../../interface/IReception";
import { NoSignerError } from "votera-sdk-common";

export class ReceptionMethods extends ClientCore implements IReceptionMethods {
    constructor(context: Context) {
        super(context);
        Object.freeze(ReceptionMethods.prototype);
        Object.freeze(this);
    }

    public async getAccount(): Promise<string> {
        const signer = this.web3.getConnectedSigner();
        if (!signer) throw new NoSignerError();
        return await signer.getAddress();
    }
}
