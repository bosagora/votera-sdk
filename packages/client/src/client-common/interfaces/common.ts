export enum SupportedNetwork {
    MAINNET = "mainnet",
    TESTNET = "testnet",
    DEVNET = "devnet",
    LOCAL = "localhost"
}

export const SupportedNetworkArray = Object.values(SupportedNetwork);

export type NetworkDeployment = {
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
    network: number;
    web3Endpoint: string;
};
export type GenericRecord = Record<string, string | number | boolean | null | undefined>;
