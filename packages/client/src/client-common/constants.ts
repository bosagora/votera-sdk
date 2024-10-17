import { NetworkDeployment, SupportedNetwork } from "./interfaces/common";
import { activeContractsList } from "votera-contracts-lib";
import { Network } from "@ethersproject/networks";

export const LIVE_CONTRACTS: { [K in SupportedNetwork]: NetworkDeployment } = {
    mainnet: {
        AddressStorage: activeContractsList.mainnet.AddressStorage,
        BudgetManager: activeContractsList.mainnet.BudgetManager,
        ParamStorage: activeContractsList.mainnet.ParamStorage,
        ParticipantStorage: activeContractsList.mainnet.ParticipantStorage,
        ProposalStorage: activeContractsList.mainnet.ProposalStorage,
        AssessmentStorage: activeContractsList.mainnet.AssessmentStorage,
        VoteStorage: activeContractsList.mainnet.VoteStorage,
        ReceptionController: activeContractsList.mainnet.ReceptionController,
        AssessmentController: activeContractsList.mainnet.AssessmentController,
        VoteController: activeContractsList.mainnet.VoteController,
        ParticipantManager: activeContractsList.mainnet.ParticipantManager,
        ExecutionManager: activeContractsList.mainnet.ExecutionManager,
        network: 2151,
        web3Endpoint: "https://mainnet.bosagora.org/"
    },
    testnet: {
        AddressStorage: activeContractsList.testnet.AddressStorage,
        BudgetManager: activeContractsList.testnet.BudgetManager,
        ParamStorage: activeContractsList.testnet.ParamStorage,
        ParticipantStorage: activeContractsList.testnet.ParticipantStorage,
        ProposalStorage: activeContractsList.testnet.ProposalStorage,
        AssessmentStorage: activeContractsList.testnet.AssessmentStorage,
        VoteStorage: activeContractsList.testnet.VoteStorage,
        ReceptionController: activeContractsList.testnet.ReceptionController,
        AssessmentController: activeContractsList.testnet.AssessmentController,
        VoteController: activeContractsList.testnet.VoteController,
        ParticipantManager: activeContractsList.testnet.ParticipantManager,
        ExecutionManager: activeContractsList.testnet.ExecutionManager,
        network: 2019,
        web3Endpoint: "https://testnet.bosagora.org/"
    },
    devnet: {
        AddressStorage: activeContractsList.devnet.AddressStorage,
        BudgetManager: activeContractsList.devnet.BudgetManager,
        ParamStorage: activeContractsList.devnet.ParamStorage,
        ParticipantStorage: activeContractsList.devnet.ParticipantStorage,
        ProposalStorage: activeContractsList.devnet.ProposalStorage,
        AssessmentStorage: activeContractsList.devnet.AssessmentStorage,
        VoteStorage: activeContractsList.devnet.VoteStorage,
        ReceptionController: activeContractsList.devnet.ReceptionController,
        AssessmentController: activeContractsList.devnet.AssessmentController,
        VoteController: activeContractsList.devnet.VoteController,
        ParticipantManager: activeContractsList.devnet.ParticipantManager,
        ExecutionManager: activeContractsList.devnet.ExecutionManager,
        network: 24680,
        web3Endpoint: "http://devnet.bosagora.org/"
    },
    localhost: {
        AddressStorage: activeContractsList.devnet.AddressStorage,
        BudgetManager: activeContractsList.devnet.BudgetManager,
        ParamStorage: activeContractsList.devnet.ParamStorage,
        ParticipantStorage: activeContractsList.devnet.ParticipantStorage,
        ProposalStorage: activeContractsList.devnet.ProposalStorage,
        AssessmentStorage: activeContractsList.devnet.AssessmentStorage,
        VoteStorage: activeContractsList.devnet.VoteStorage,
        ReceptionController: activeContractsList.devnet.ReceptionController,
        AssessmentController: activeContractsList.devnet.AssessmentController,
        VoteController: activeContractsList.devnet.VoteController,
        ParticipantManager: activeContractsList.devnet.ParticipantManager,
        ExecutionManager: activeContractsList.devnet.ExecutionManager,
        network: 24680,
        web3Endpoint: "http://localhost:8545/"
    }
};

export const ADDITIONAL_NETWORKS: Network[] = [
    {
        name: SupportedNetwork.MAINNET,
        chainId: 2151
    },
    {
        name: SupportedNetwork.TESTNET,
        chainId: 2019
    },
    {
        name: SupportedNetwork.DEVNET,
        chainId: 24680
    }
];
