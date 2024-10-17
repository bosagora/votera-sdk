import { IClientCore } from "../client-common";

export interface IVote {
    vote: IVoteMethods;
}

export interface IVoteMethods extends IClientCore {
    getAccount: () => Promise<string>;
}
