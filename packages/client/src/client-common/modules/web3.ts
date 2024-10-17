import { Wallet } from "@ethersproject/wallet";
import { JsonRpcProvider, Networkish } from "@ethersproject/providers";
import { Contract, ContractInterface } from "@ethersproject/contracts";
import { Signer } from "@ethersproject/abstract-signer";
import { IClientWeb3Core } from "../interfaces/core";
import { Context } from "../context";
import {
    NoProposalStorageAddress,
    NoBudgetManagerAddress,
    NoParamStorageAddress,
    NoAssessmentStorageAddress,
    NoAddressStorageAddress,
    NoExecutionManagerAddress,
    NoParticipantStorageAddress,
    NoVoteStorageAddress,
    NoReceptionControllerAddress,
    NoVoteControllerAddress,
    NoParticipantManagerAddress,
    NoAssessmentControllerAddress,
    NoNetwork
} from "../../utils/errors";

import { UnsupportedNetworkError } from "votera-sdk-common";

const networkMap = new Map<Web3Module, Networkish>();
const providersMap = new Map<Web3Module, JsonRpcProvider>();
const signerMap = new Map<Web3Module, Signer>();

const AddressStorageAddressMap = new Map<Web3Module, string>();
const BudgetManagerAddressMap = new Map<Web3Module, string>();
const ParamStorageAddressMap = new Map<Web3Module, string>();
const ParticipantStorageAddressMap = new Map<Web3Module, string>();
const ProposalStorageAddressMap = new Map<Web3Module, string>();
const AssessmentStorageAddressMap = new Map<Web3Module, string>();
const VoteStorageAddressMap = new Map<Web3Module, string>();
const ReceptionControllerAddressMap = new Map<Web3Module, string>();
const AssessmentControllerAddressMap = new Map<Web3Module, string>();
const VoteControllerAddressMap = new Map<Web3Module, string>();
const ParticipantManagerAddressMap = new Map<Web3Module, string>();
const ExecutionManagerAddressMap = new Map<Web3Module, string>();

export class Web3Module implements IClientWeb3Core {
    constructor(context: Context) {
        // Storing client data in the private module's scope to prevent external mutation
        if (context.network) {
            networkMap.set(this, context.network);
        }

        if (context.web3Provider) {
            providersMap.set(this, context.web3Provider);
        }

        if (context.signer) {
            this.useSigner(context.signer);
        }

        if (context.AddressStorage) {
            AddressStorageAddressMap.set(this, context.AddressStorage);
        }

        if (context.BudgetManager) {
            BudgetManagerAddressMap.set(this, context.BudgetManager);
        }

        if (context.ParamStorage) {
            ParamStorageAddressMap.set(this, context.ParamStorage);
        }

        if (context.ParticipantStorage) {
            ParticipantStorageAddressMap.set(this, context.ParticipantStorage);
        }

        if (context.ProposalStorage) {
            ProposalStorageAddressMap.set(this, context.ProposalStorage);
        }

        if (context.AssessmentStorage) {
            AssessmentStorageAddressMap.set(this, context.AssessmentStorage);
        }

        if (context.VoteStorage) {
            VoteStorageAddressMap.set(this, context.VoteStorage);
        }

        if (context.ReceptionController) {
            ReceptionControllerAddressMap.set(this, context.ReceptionController);
        }

        if (context.AssessmentController) {
            AssessmentControllerAddressMap.set(this, context.AssessmentController);
        }

        if (context.VoteController) {
            VoteControllerAddressMap.set(this, context.VoteController);
        }

        if (context.ParticipantManager) {
            ParticipantManagerAddressMap.set(this, context.ParticipantManager);
        }

        if (context.ExecutionManager) {
            ExecutionManagerAddressMap.set(this, context.ExecutionManager);
        }

        Object.freeze(Web3Module.prototype);
        Object.freeze(this);
    }

    private get network(): Networkish | undefined {
        return networkMap.get(this);
    }

    private get AddressStorage(): string {
        return AddressStorageAddressMap.get(this) || "";
    }

    private get BudgetManager(): string {
        return BudgetManagerAddressMap.get(this) || "";
    }

    private get ParamStorage(): string {
        return ParamStorageAddressMap.get(this) || "";
    }

    private get ParticipantStorage(): string {
        return ParticipantStorageAddressMap.get(this) || "";
    }

    private get ProposalStorage(): string {
        return ProposalStorageAddressMap.get(this) || "";
    }

    private get AssessmentStorage(): string {
        return AssessmentStorageAddressMap.get(this) || "";
    }

    private get VoteStorage(): string {
        return VoteStorageAddressMap.get(this) || "";
    }

    private get ReceptionController(): string {
        return ReceptionControllerAddressMap.get(this) || "";
    }

    private get AssessmentController(): string {
        return AssessmentControllerAddressMap.get(this) || "";
    }

    private get VoteController(): string {
        return VoteControllerAddressMap.get(this) || "";
    }

    private get ParticipantManager(): string {
        return ParticipantManagerAddressMap.get(this) || "";
    }

    private get ExecutionManager(): string {
        return ExecutionManagerAddressMap.get(this) || "";
    }

    private get provider(): JsonRpcProvider | undefined {
        return providersMap.get(this);
    }

    private get signer(): Signer | undefined {
        return signerMap.get(this);
    }

    public usePrivateKey(privateKey: string): void {
        const provider = this.getProvider();
        const signer = provider !== undefined ? new Wallet(privateKey, provider) : new Wallet(privateKey);
        signerMap.set(this, signer);
    }

    /** Replaces the current signer by the given one */
    public useSigner(signer: Signer): void {
        if (!signer) {
            throw new Error("Empty wallet or signer");
        }
        signerMap.set(this, signer);
    }

    /** Retrieves the current signer */
    public getSigner(): Signer | undefined {
        return this.signer;
    }

    /** Returns a signer connected to the current network provider */
    public getConnectedSigner(): Signer {
        let signer = this.getSigner();
        if (!signer) {
            throw new Error("No signer");
        } else if (!signer.provider && !this.getProvider()) {
            throw new Error("No provider");
        } else if (signer.provider) {
            return signer;
        }

        const provider = this.getProvider();
        if (!provider) throw new Error("No provider");

        signer = signer.connect(provider);
        return signer;
    }

    /** Returns the currently active network provider */
    public getProvider(): JsonRpcProvider | undefined {
        return this.provider;
    }

    /** Returns whether the current provider is functional or not */
    public isUp(): Promise<boolean> {
        const provider = this.getProvider();
        if (!provider) return Promise.reject(new Error("No provider"));

        return provider
            .getNetwork()
            .then(() => true)
            .catch(() => false);
    }

    /**
     * Returns a contract instance at the given address
     *
     * @param address Contract instance address
     * @param abi The Application Binary Inteface of the contract
     * @return A contract instance attached to the given address
     */
    public attachContract<T>(address: string, abi: ContractInterface): Contract & T {
        if (!address) throw new Error("Invalid contract address");
        else if (!abi) throw new Error("Invalid contract ABI");

        const signer = this.getSigner();
        if (!signer && !this.getProvider()) {
            throw new Error("No signer");
        }

        const provider = this.getProvider();
        if (!provider) throw new Error("No provider");

        const contract = new Contract(address, abi, provider);

        if (!signer) {
            return contract as Contract & T;
        } else if (signer instanceof Wallet) {
            return contract.connect(signer.connect(provider)) as Contract & T;
        }

        return contract.connect(signer) as Contract & T;
    }

    public getNetwork(): Networkish {
        if (!this.network) {
            throw new NoNetwork();
        }
        return this.network;
    }

    public getChainId(): number {
        const network = this.getNetwork();
        if (typeof network == "string") {
            throw new UnsupportedNetworkError(network);
        } else if (typeof network == "number") {
            return network;
        } else {
            if (network.chainId !== undefined) return network.chainId;
            else throw new UnsupportedNetworkError("");
        }
    }

    public getAddressStorageAddress(): string {
        if (!this.AddressStorage) {
            throw new NoAddressStorageAddress();
        }
        return this.AddressStorage;
    }

    public getBudgetManagerAddress(): string {
        if (!this.BudgetManager) {
            throw new NoBudgetManagerAddress();
        }
        return this.BudgetManager;
    }

    public getParamStorageAddress(): string {
        if (!this.ParamStorage) {
            throw new NoParamStorageAddress();
        }
        return this.ParamStorage;
    }

    public getParticipantStorageAddress(): string {
        if (!this.ParticipantStorage) {
            throw new NoParticipantStorageAddress();
        }
        return this.ParticipantStorage;
    }

    public getProposalStorageAddress(): string {
        if (!this.ProposalStorage) {
            throw new NoProposalStorageAddress();
        }
        return this.ProposalStorage;
    }

    public getAssessmentStorageAddress(): string {
        if (!this.AssessmentStorage) {
            throw new NoAssessmentStorageAddress();
        }
        return this.AssessmentStorage;
    }

    public getVoteStorageAddress(): string {
        if (!this.VoteStorage) {
            throw new NoVoteStorageAddress();
        }
        return this.VoteStorage;
    }

    public getReceptionControllerAddress(): string {
        if (!this.ReceptionController) {
            throw new NoReceptionControllerAddress();
        }
        return this.ReceptionController;
    }

    public getAssessmentControllerAddress(): string {
        if (!this.AssessmentController) {
            throw new NoAssessmentControllerAddress();
        }
        return this.AssessmentController;
    }

    public getVoteControllerAddress(): string {
        if (!this.VoteController) {
            throw new NoVoteControllerAddress();
        }
        return this.VoteController;
    }

    public getParticipantManagerAddress(): string {
        if (!this.ParticipantManager) {
            throw new NoParticipantManagerAddress();
        }
        return this.ParticipantManager;
    }

    public getExecutionManagerAddress(): string {
        if (!this.ExecutionManager) {
            throw new NoExecutionManagerAddress();
        }
        return this.ExecutionManager;
    }
}
