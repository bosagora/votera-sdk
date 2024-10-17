import { ClientCore, Context } from "./client-common";
import { ClientMethods } from "./internal/client/ClientMethods";
import { IClient, IClientMethods } from "./interface/IClientMethods";

import { Signer } from "@ethersproject/abstract-signer";

export class Client extends ClientCore implements IClient {
    private readonly privateMethods: ClientMethods;

    constructor(context: Context) {
        super(context);
        this.privateMethods = new ClientMethods(context);
        Object.freeze(Client.prototype);
        Object.freeze(this);
    }

    /** Replaces the current signer by the given one */
    public useSigner(signer: Signer): void {
        if (!signer) {
            throw new Error("Empty wallet or signer");
        }
        this.web3.useSigner(signer);
        this.privateMethods.web3.useSigner(signer);
    }

    public get methods(): IClientMethods {
        return this.privateMethods;
    }
}
