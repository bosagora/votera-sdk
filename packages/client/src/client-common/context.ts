import { ContextParams, ContextState } from "./interfaces/context";
import { SupportedNetwork, SupportedNetworkArray } from "./interfaces/common";
import { InvalidAddressError, UnsupportedProtocolError, UnsupportedNetworkError } from "votera-sdk-common";
import { getNetwork } from "../utils/Utilty";
import { LIVE_CONTRACTS } from "./constants";

import { isAddress } from "@ethersproject/address";
import { Network } from "@ethersproject/networks";
import { JsonRpcProvider, Networkish } from "@ethersproject/providers";
import { AddressZero } from "@ethersproject/constants";
import { Wallet } from "@ethersproject/wallet";
export { ContextParams } from "./interfaces/context";

const supportedProtocols = ["https:", "http:"];
// if (typeof process !== "undefined" && process.env?.TESTING) {
//     supportedProtocols.push("http:");
// }

export class Context {
    protected state: ContextState = Object.assign({});

    // INTERNAL CONTEXT STATE

    /**
     * @param {Object} params
     *
     * @constructor
     */
    constructor(params: Partial<ContextParams>) {
        this.set(params);
    }

    /**
     * Getter for the network
     *
     * @var network
     *
     * @returns {Networkish}
     *
     * @public
     */
    get network() {
        return this.state.network;
    }

    /**
     * Getter for the Signer
     *
     * @var signer
     *
     * @returns {Signer}
     *
     * @public
     */
    get signer() {
        return this.state.signer;
    }

    // GETTERS

    /**
     * Getter for the web3 providers
     *
     * @var web3Provider
     *
     * @returns {JsonRpcProvider[]}
     *
     * @public
     */
    get web3Provider() {
        return this.state.web3Provider;
    }

    get AddressStorage(): string | undefined {
        return this.state.AddressStorage;
    }

    get BudgetManager(): string | undefined {
        return this.state.BudgetManager;
    }

    get ParamStorage(): string | undefined {
        return this.state.ParamStorage;
    }

    get ParticipantStorage(): string | undefined {
        return this.state.ParticipantStorage;
    }

    get ProposalStorage(): string | undefined {
        return this.state.ProposalStorage;
    }

    get AssessmentStorage(): string | undefined {
        return this.state.AssessmentStorage;
    }

    get VoteStorage(): string | undefined {
        return this.state.VoteStorage;
    }

    get ReceptionController(): string | undefined {
        return this.state.ReceptionController;
    }

    get AssessmentController(): string | undefined {
        return this.state.AssessmentController;
    }

    get VoteController(): string | undefined {
        return this.state.VoteController;
    }

    get ParticipantManager(): string | undefined {
        return this.state.ParticipantManager;
    }

    get ExecutionManager(): string | undefined {
        return this.state.ExecutionManager;
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

    private static resolveWeb3Provider(endpoint: string | JsonRpcProvider, network: Networkish): JsonRpcProvider {
        if (typeof endpoint === "string") {
            const url = new URL(endpoint);
            if (!supportedProtocols.includes(url.protocol)) {
                throw new UnsupportedProtocolError(url.protocol);
            }
            return new JsonRpcProvider(url.href, this.resolveNetwork(network));
        } else {
            return endpoint;
        }
    }

    /**
     * Does set and parse the given context configuration object
     *
     * @returns {void}
     *
     * @private
     */
    setFull(contextParams: ContextParams): void {
        if (!contextParams.network) {
            throw new Error("Missing network");
        } else if (!contextParams.privateKey) {
            throw new Error("Please pass the required signer");
        } else if (!contextParams.web3Provider) {
            throw new Error("No web3 endpoints defined");
        } else if (!contextParams.AddressStorage) {
            throw new Error("Missing AddressStorage contract address");
        } else if (!contextParams.BudgetManager) {
            throw new Error("Missing BudgetManager contract address");
        } else if (!contextParams.ParamStorage) {
            throw new Error("Missing ParamStorage contract address");
        } else if (!contextParams.ParticipantStorage) {
            throw new Error("Missing ParticipantStorage contract address");
        } else if (!contextParams.ProposalStorage) {
            throw new Error("Missing ProposalStorage  contract address");
        } else if (!contextParams.AssessmentStorage) {
            throw new Error("Missing AssessmentStorage contract address");
        } else if (!contextParams.VoteStorage) {
            throw new Error("Missing VoteStorage contract address");
        } else if (!contextParams.ReceptionController) {
            throw new Error("Missing ReceptionController contract address");
        } else if (!contextParams.AssessmentController) {
            throw new Error("Missing AssessmentController contract address");
        } else if (!contextParams.VoteController) {
            throw new Error("Missing VoteController contract address");
        } else if (!contextParams.ParticipantManager) {
            throw new Error("Missing ParticipantManager contract address");
        } else if (!contextParams.ExecutionManager) {
            throw new Error("Missing ExecutionManager contract address");
        }

        this.state = {
            network: contextParams.network,
            signer: new Wallet(contextParams.privateKey),
            web3Provider: Context.resolveWeb3Provider(contextParams.web3Provider, contextParams.network),
            AddressStorage: contextParams.AddressStorage,
            BudgetManager: contextParams.BudgetManager,
            ParamStorage: contextParams.ParamStorage,
            ParticipantStorage: contextParams.ParticipantStorage,
            ProposalStorage: contextParams.ProposalStorage,
            AssessmentStorage: contextParams.AssessmentStorage,
            VoteStorage: contextParams.VoteStorage,
            ReceptionController: contextParams.ReceptionController,
            AssessmentController: contextParams.AssessmentController,
            VoteController: contextParams.VoteController,
            ParticipantManager: contextParams.ParticipantManager,
            ExecutionManager: contextParams.ExecutionManager
        };
    }

    set(contextParams: Partial<ContextParams>) {
        if (contextParams.network) {
            this.state.network = contextParams.network;
        }
        if (contextParams.privateKey) {
            this.state.signer = new Wallet(contextParams.privateKey);
        }
        if (contextParams.web3Provider) {
            this.state.web3Provider = Context.resolveWeb3Provider(contextParams.web3Provider, this.state.network);
        }
        if (contextParams.AddressStorage) {
            this.state.AddressStorage = contextParams.AddressStorage;
        }
        if (contextParams.BudgetManager) {
            this.state.BudgetManager = contextParams.BudgetManager;
        }
        if (contextParams.ParamStorage) {
            this.state.ParamStorage = contextParams.ParamStorage;
        }
        if (contextParams.ParticipantStorage) {
            this.state.ParticipantStorage = contextParams.ParticipantStorage;
        }
        if (contextParams.ProposalStorage) {
            this.state.ProposalStorage = contextParams.ProposalStorage;
        }
        if (contextParams.AssessmentStorage) {
            this.state.AssessmentStorage = contextParams.AssessmentStorage;
        }
        if (contextParams.VoteStorage) {
            this.state.VoteStorage = contextParams.VoteStorage;
        }
        if (contextParams.ReceptionController) {
            this.state.ReceptionController = contextParams.ReceptionController;
        }
        if (contextParams.AssessmentController) {
            this.state.AssessmentController = contextParams.AssessmentController;
        }
        if (contextParams.VoteController) {
            this.state.VoteController = contextParams.VoteController;
        }
        if (contextParams.ParticipantManager) {
            this.state.ParticipantManager = contextParams.ParticipantManager;
        }
        if (contextParams.ExecutionManager) {
            this.state.ExecutionManager = contextParams.ExecutionManager;
        }
    }
}

export class ContextBuilder {
    public static buildContextParams(networkName: SupportedNetwork, defaultPrivateKey: string): ContextParams {
        return {
            network: LIVE_CONTRACTS[networkName].network,
            privateKey: defaultPrivateKey,
            AddressStorage: LIVE_CONTRACTS[networkName].AddressStorage,
            BudgetManager: LIVE_CONTRACTS[networkName].BudgetManager,
            ParamStorage: LIVE_CONTRACTS[networkName].ParamStorage,
            ParticipantStorage: LIVE_CONTRACTS[networkName].ParticipantStorage,
            ProposalStorage: LIVE_CONTRACTS[networkName].ProposalStorage,
            AssessmentStorage: LIVE_CONTRACTS[networkName].AssessmentStorage,
            VoteStorage: LIVE_CONTRACTS[networkName].VoteStorage,
            ReceptionController: LIVE_CONTRACTS[networkName].ReceptionController,
            AssessmentController: LIVE_CONTRACTS[networkName].AssessmentController,
            VoteController: LIVE_CONTRACTS[networkName].VoteController,
            ParticipantManager: LIVE_CONTRACTS[networkName].ParticipantManager,
            ExecutionManager: LIVE_CONTRACTS[networkName].ExecutionManager,
            web3Provider: LIVE_CONTRACTS[networkName].web3Endpoint
        };
    }

    public static buildContextParamsOfMainnet(defaultPrivateKey: string): ContextParams {
        return ContextBuilder.buildContextParams(SupportedNetwork.MAINNET, defaultPrivateKey);
    }

    public static buildContextParamsOfTestnet(defaultPrivateKey: string): ContextParams {
        return ContextBuilder.buildContextParams(SupportedNetwork.TESTNET, defaultPrivateKey);
    }

    public static buildContextParamsOfDevnet(defaultPrivateKey: string): ContextParams {
        return ContextBuilder.buildContextParams(SupportedNetwork.DEVNET, defaultPrivateKey);
    }

    public static buildContext(networkName: SupportedNetwork, defaultPrivateKey: string): Context {
        const contextParams = ContextBuilder.buildContextParams(networkName, defaultPrivateKey);
        return new Context(contextParams);
    }

    public static buildContextOfMainnet(defaultPrivateKey: string): Context {
        return ContextBuilder.buildContext(SupportedNetwork.MAINNET, defaultPrivateKey);
    }

    public static buildContextOfTestnet(defaultPrivateKey: string): Context {
        return ContextBuilder.buildContext(SupportedNetwork.TESTNET, defaultPrivateKey);
    }

    public static buildContextOfDevnet(defaultPrivateKey: string): Context {
        return ContextBuilder.buildContext(SupportedNetwork.DEVNET, defaultPrivateKey);
    }
}
