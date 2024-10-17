import * as dotenv from "dotenv";
import { JsonRpcProvider, Networkish } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import {
    Amount,
    ContractUtils,
    ContextBuilder,
    GasPriceManager,
    ContextParams,
    LIVE_CONTRACTS,
    NonceManager,
    SupportedNetwork,
    SupportedNetworkArray
} from "../../src";
import {
    AddressStorage,
    AddressStorage__factory,
    AssessmentStorage,
    AssessmentStorage__factory,
    BudgetManager,
    BudgetManager__factory,
    ParamStorage,
    ParamStorage__factory,
    ParticipantStorage,
    ParticipantStorage__factory,
    ProposalStorage,
    ProposalStorage__factory,
    VoteStorage,
    VoteStorage__factory,
    ReceptionController,
    ReceptionController__factory,
    AssessmentController,
    AssessmentController__factory,
    VoteController,
    VoteController__factory,
    ParticipantManager,
    ParticipantManager__factory,
    ExecutionManager,
    ExecutionManager__factory
} from "votera-contracts-lib";
import { Signer } from "@ethersproject/abstract-signer";
import { Network } from "@ethersproject/networks";
import { getNetwork } from "../../src/utils/Utilty";
import { InvalidAddressError, UnsupportedNetworkError } from "votera-sdk-common";
import { isAddress } from "@ethersproject/address";
import { AddressZero } from "@ethersproject/constants";

dotenv.config({ path: "env/.env" });

export enum AccountIndex {
    DEPLOYER,
    OWNER
}

export interface IContractInfo {
    provider: JsonRpcProvider;
    AddressStorage: AddressStorage;
    BudgetManager: BudgetManager;
    ParamStorage: ParamStorage;
    ParticipantStorage: ParticipantStorage;
    ProposalStorage: ProposalStorage;
    AssessmentStorage: AssessmentStorage;
    VoteStorage: VoteStorage;
    ReceptionController: ReceptionController;
    AssessmentController: AssessmentController;
    VoteController: VoteController;
    ParticipantManager: ParticipantManager;
    ExecutionManager: ExecutionManager;
}

export class NodeInfo {
    public static initialAccounts: any[];
    public static RELAY_ACCESS_KEY = process.env.RELAY_ACCESS_KEY || "";
    public static NETWORK_NAME: SupportedNetwork = (process.env.NETWORK_NAME || "devnet") as SupportedNetwork;

    public static CreateInitialAccounts(): any[] {
        const accounts: string[] = [];
        const reg_bytes64: RegExp = /^(0x)[0-9a-f]{64}$/i;
        if (
            process.env.DEPLOYER !== undefined &&
            process.env.DEPLOYER.trim() !== "" &&
            reg_bytes64.test(process.env.DEPLOYER)
        ) {
            accounts.push(process.env.DEPLOYER);
        } else {
            process.env.DEPLOYER = Wallet.createRandom().privateKey;
            accounts.push(process.env.DEPLOYER);
        }

        if (process.env.OWNER !== undefined && process.env.OWNER.trim() !== "" && reg_bytes64.test(process.env.OWNER)) {
            accounts.push(process.env.OWNER);
        } else {
            process.env.OWNER = Wallet.createRandom().privateKey;
            accounts.push(process.env.OWNER);
        }

        while (accounts.length < 70) {
            accounts.push(Wallet.createRandom().privateKey);
        }

        return accounts.map((m) => {
            return {
                balance: "0x100000000000000000000",
                secretKey: m
            };
        });
    }

    public static accounts(): Signer[] {
        if (NodeInfo.initialAccounts === undefined) {
            NodeInfo.initialAccounts = NodeInfo.CreateInitialAccounts();
        }
        return NodeInfo.initialAccounts.map(
            (m) => new NonceManager(new GasPriceManager(new Wallet(m.secretKey).connect(NodeInfo.createProvider())))
        );
    }

    // INTERNAL HELPERS
    private static resolveNetwork(networkish: Networkish, ensRegistryAddress?: string): Network {
        const network = getNetwork(networkish);
        const networkName = network.name as SupportedNetwork;
        if (!SupportedNetworkArray.includes(networkName)) {
            throw new UnsupportedNetworkError(networkName);
        }

        if (ensRegistryAddress) {
            if (!isAddress(ensRegistryAddress)) {
                throw new InvalidAddressError();
            } else {
                network.ensAddress = ensRegistryAddress;
            }
        }

        if (!network.ensAddress) {
            network.ensAddress = AddressZero;
        }
        return network;
    }

    private static resolveWeb3Provider(endpoints: string | JsonRpcProvider, network: Networkish): JsonRpcProvider {
        if (typeof endpoints === "string") {
            const url = new URL(endpoints);
            return new JsonRpcProvider(url.href, this.resolveNetwork(network));
        } else {
            return endpoints;
        }
    }

    public static createProvider(): JsonRpcProvider {
        const networkName = this.NETWORK_NAME;
        return this.resolveWeb3Provider(LIVE_CONTRACTS[networkName].web3Endpoint, LIVE_CONTRACTS[networkName].network);
    }

    public static getContextParams(): ContextParams {
        if (NodeInfo.initialAccounts === undefined) {
            NodeInfo.initialAccounts = NodeInfo.CreateInitialAccounts();
        }
        const networkName = this.NETWORK_NAME;
        return ContextBuilder.buildContextParams(networkName, NodeInfo.initialAccounts[0].secretKey);
    }

    public static getChainId(): number {
        const contextParams = NodeInfo.getContextParams();
        return contextParams.network;
    }

    public static getContractInfo(): IContractInfo {
        const provider = NodeInfo.createProvider();
        const contextParams = NodeInfo.getContextParams();

        console.log("Start Attach");

        console.log("Attach AddressStorage");
        const AddressStorage = AddressStorage__factory.connect(contextParams.AddressStorage, provider);

        console.log("Attach AddressStorage");
        const AssessmentStorage = AssessmentStorage__factory.connect(contextParams.AssessmentStorage, provider);

        console.log("Attach ParamStorage");
        const ParamStorage = ParamStorage__factory.connect(contextParams.ParamStorage, provider);

        console.log("Attach ParticipantStorage");
        const ParticipantStorage = ParticipantStorage__factory.connect(contextParams.ParticipantStorage, provider);

        console.log("Attach VoteStorage");
        const VoteStorage = VoteStorage__factory.connect(contextParams.VoteStorage, provider);

        console.log("Attach ProposalStorage");
        const ProposalStorage = ProposalStorage__factory.connect(contextParams.ProposalStorage, provider);

        console.log("Attach ReceptionController");
        const ReceptionController = ReceptionController__factory.connect(contextParams.ReceptionController, provider);

        console.log("Attach AssessmentController");
        const AssessmentController = AssessmentController__factory.connect(
            contextParams.AssessmentController,
            provider
        );

        console.log("Attach VoteController");
        const VoteController = VoteController__factory.connect(contextParams.VoteController, provider);

        console.log("Attach ParticipantManager");
        const ParticipantManager = ParticipantManager__factory.connect(contextParams.ParticipantManager, provider);

        console.log("Attach ExecutionManager");
        const ExecutionManager = ExecutionManager__factory.connect(contextParams.ExecutionManager, provider);

        console.log("Attach BudgetManager");
        const BudgetManager = BudgetManager__factory.connect(contextParams.BudgetManager, provider);

        console.log("Complete Attach");
        return {
            provider: provider,
            AddressStorage,
            AssessmentStorage,
            BudgetManager,
            ParamStorage,
            ParticipantStorage,
            ProposalStorage,
            VoteStorage,
            ReceptionController,
            AssessmentController,
            VoteController,
            ParticipantManager,
            ExecutionManager
        };
    }
}
