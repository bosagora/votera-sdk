// This file defines the interfaces of the context object holding client settings

import { Signer } from "@ethersproject/abstract-signer";
import { JsonRpcProvider, Networkish } from "@ethersproject/providers";

// Context input parameters
type Web3ContextParams = {
    network: number;
    privateKey: string;
    web3Provider: string;
    AddressStorage: string;
    BudgetManager: string;
    ParamStorage: string;
    ParticipantStorage: string;
    ProposalStorage: string;
    AssessmentStorage: string;
    VoteStorage: string;
    ReceptionController: string;
    AssessmentController: string;
    VoteController: string;
    ParticipantManager: string;
    ExecutionManager: string;
};

export type ContextParams = Web3ContextParams;

// Context state data
type Web3ContextState = {
    network: Networkish;
    signer?: Signer;
    web3Provider: JsonRpcProvider;

    AddressStorage?: string;
    BudgetManager?: string;
    ParamStorage?: string;
    ParticipantStorage?: string;
    ProposalStorage?: string;
    AssessmentStorage?: string;
    VoteStorage?: string;
    ReceptionController?: string;
    AssessmentController?: string;
    VoteController?: string;
    ParticipantManager?: string;
    ExecutionManager?: string;
};

export type ContextState = Web3ContextState;
