import { Signer } from "@ethersproject/abstract-signer";
import { Contract, ContractInterface } from "@ethersproject/contracts";
import { JsonRpcProvider } from "@ethersproject/providers";

export interface IClientWeb3Core {
    usePrivateKey: (privateKey: string) => void;
    useSigner: (signer: Signer) => void;
    getSigner: () => Signer | undefined;
    getConnectedSigner: () => Signer;
    getProvider: () => JsonRpcProvider | undefined;
    isUp: () => Promise<boolean>;
    attachContract: <T>(address: string, abi: ContractInterface) => Contract & T;

    getChainId: () => number;
    getAddressStorageAddress: () => string;
    getBudgetManagerAddress: () => string;
    getParamStorageAddress: () => string;
    getParticipantStorageAddress: () => string;
    getProposalStorageAddress: () => string;
    getAssessmentStorageAddress: () => string;
    getVoteStorageAddress: () => string;
    getReceptionControllerAddress: () => string;
    getAssessmentControllerAddress: () => string;
    getVoteControllerAddress: () => string;
    getParticipantManagerAddress: () => string;
    getExecutionManagerAddress: () => string;
}

export interface IClientCore {
    web3: IClientWeb3Core;
}
