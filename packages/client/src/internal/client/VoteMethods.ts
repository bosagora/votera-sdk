import { ClientCore, Context } from "../../client-common";
import { IVoteMethods } from "../../interface/IVote";
import { NoSignerError } from "votera-sdk-common";

export class VoteMethods extends ClientCore implements IVoteMethods {
    constructor(context: Context) {
        super(context);
        Object.freeze(VoteMethods.prototype);
        Object.freeze(this);
    }

    public async getAccount(): Promise<string> {
        const signer = this.web3.getConnectedSigner();
        if (!signer) throw new NoSignerError();
        return await signer.getAddress();
    }
}
