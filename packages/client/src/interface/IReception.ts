import { IClientCore } from "../client-common";

export interface IReception {
    reception: IReceptionMethods;
}

export interface IReceptionMethods extends IClientCore {
    getAccount: () => Promise<string>;
}
