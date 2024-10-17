import * as dotenv from "dotenv";

import { ContextParams } from "../../src";
import { AddressZero } from "@ethersproject/constants";
import { activeContractsList } from "votera-contracts-lib";
dotenv.config({ path: "env/.env" });

export const web3EndpointsMainnet = {
    working: "https://rpc.main.acccoin.io/",
    failing: "https://bad-url-gateway.io/"
};

export const web3EndpointsTestnet = {
    working: "https://rpc.test.acccoin.io/",
    failing: "https://bad-url-gateway.io/"
};

export const web3EndpointsDevnet = {
    working: "http://rpc-side.dev.acccoin.io:28545/",
    failing: "https://bad-url-gateway.io/"
};

export const TEST_WALLET = "d09672244a06a32f74d051e5adbbb62ae0eda27832a973159d475da6d53ba5c0";

export const contextParamsMainnet: ContextParams = {
    network: 215110,
    privateKey: TEST_WALLET,
    web3Provider: web3EndpointsMainnet.working,
    AddressStorage: AddressZero,
    BudgetManager: AddressZero,
    ParamStorage: AddressZero,
    ParticipantStorage: AddressZero,
    ProposalStorage: AddressZero,
    AssessmentStorage: AddressZero,
    VoteStorage: AddressZero,
    ReceptionController: AddressZero,
    AssessmentController: AddressZero,
    VoteController: AddressZero,
    ParticipantManager: AddressZero,
    ExecutionManager: AddressZero
};

export const contextParamsTestnet: ContextParams = {
    network: 215115,
    privateKey: TEST_WALLET,
    web3Provider: web3EndpointsTestnet.working,
    AddressStorage: AddressZero,
    BudgetManager: AddressZero,
    ParamStorage: AddressZero,
    ParticipantStorage: AddressZero,
    ProposalStorage: AddressZero,
    AssessmentStorage: AddressZero,
    VoteStorage: AddressZero,
    ReceptionController: AddressZero,
    AssessmentController: AddressZero,
    VoteController: AddressZero,
    ParticipantManager: AddressZero,
    ExecutionManager: AddressZero
};

export const contextParamsDevnet: ContextParams = {
    network: 24680,
    privateKey: TEST_WALLET,
    web3Provider: web3EndpointsDevnet.working,
    AddressStorage: AddressZero,
    BudgetManager: AddressZero,
    ParamStorage: AddressZero,
    ParticipantStorage: AddressZero,
    ProposalStorage: AddressZero,
    AssessmentStorage: AddressZero,
    VoteStorage: AddressZero,
    ReceptionController: AddressZero,
    AssessmentController: AddressZero,
    VoteController: AddressZero,
    ParticipantManager: AddressZero,
    ExecutionManager: AddressZero
};

export const contextParamsLocalChain: ContextParams = {
    network: 24680,
    privateKey: TEST_WALLET,
    web3Provider: "http://localhost:8545",
    AddressStorage: AddressZero,
    BudgetManager: AddressZero,
    ParamStorage: AddressZero,
    ParticipantStorage: AddressZero,
    ProposalStorage: AddressZero,
    AssessmentStorage: AddressZero,
    VoteStorage: AddressZero,
    ReceptionController: AddressZero,
    AssessmentController: AddressZero,
    VoteController: AddressZero,
    ParticipantManager: AddressZero,
    ExecutionManager: AddressZero
};

export const contextParamsFailing: ContextParams = {
    network: 24680,
    privateKey: TEST_WALLET,
    web3Provider: web3EndpointsMainnet.failing,
    AddressStorage: AddressZero,
    BudgetManager: AddressZero,
    ParamStorage: AddressZero,
    ParticipantStorage: AddressZero,
    ProposalStorage: AddressZero,
    AssessmentStorage: AddressZero,
    VoteStorage: AddressZero,
    ReceptionController: AddressZero,
    AssessmentController: AddressZero,
    VoteController: AddressZero,
    ParticipantManager: AddressZero,
    ExecutionManager: AddressZero
};
