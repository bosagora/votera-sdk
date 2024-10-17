import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { BytesLike } from "@ethersproject/bytes";
import { ContractReceipt, ContractTransaction } from "@ethersproject/contracts";
import { Provider } from "@ethersproject/providers";

import {
    AssessmentController,
    AssessmentController__factory,
    AssessmentStorage,
    AssessmentStorage__factory,
    ParamStorage,
    ParamStorage__factory,
    ProposalStorage,
    ProposalStorage__factory,
    ReceptionController,
    ReceptionController__factory,
    VoteController,
    VoteController__factory,
    VoteStorage,
    VoteStorage__factory
} from "votera-contracts-lib";

import {
    NoProviderError,
    NoSignerError,
    PostBallotError,
    PostCommentError,
    ProposalCreationError
} from "votera-sdk-common";

import { ClientCore, Context } from "../../client-common";
import { IClientMethods } from "../../interface/IClientMethods";
import {
    AssessmentPostScoreStepValue,
    AssessmentPostCommentStepValue,
    Candidate,
    CreateProposalStepValue,
    IScoreData,
    ICommentData,
    IParamValue,
    IProposalData,
    ISystemProposalParam,
    IVoteBallotData,
    NormalSteps,
    ProposalPeriod,
    ProposalStates,
    ProposalType,
    SortType,
    SystemProposalType,
    TransitionStepValue,
    VotePostBallotStepValue,
    VoteResult
} from "../../interfaces";
import { ContractUtils } from "../../utils/ContractUtils";

export class ClientMethods extends ClientCore implements IClientMethods {
    constructor(context: Context) {
        super(context);
        Object.freeze(ClientMethods.prototype);
        Object.freeze(this);
    }

    public async getAccount(): Promise<string> {
        const signer = this.web3.getConnectedSigner();
        if (!signer) throw new NoSignerError();
        return await signer.getAddress();
    }

    private getProposalStorage(): ProposalStorage {
        const provider = this.web3.getProvider() as Provider;
        if (!provider) throw new NoProviderError();

        return ProposalStorage__factory.connect(this.web3.getProposalStorageAddress(), provider);
    }

    private getReceptionController(): ReceptionController {
        const provider = this.web3.getProvider() as Provider;
        if (!provider) throw new NoProviderError();

        return ReceptionController__factory.connect(this.web3.getReceptionControllerAddress(), provider);
    }

    private getReceptionControllerWithSigner(): ReceptionController {
        const signer = this.web3.getConnectedSigner();
        if (!signer) throw new NoSignerError();

        return ReceptionController__factory.connect(this.web3.getReceptionControllerAddress(), signer);
    }

    public async isAvailableProposalId(proposalId: BytesLike): Promise<boolean> {
        return this.getReceptionController().isAvailableProposalId(proposalId);
    }

    public async getProposalFee(proposalType: ProposalType, fundAmount: BigNumberish): Promise<BigNumber> {
        if (proposalType === ProposalType.FUND) {
            const param = await this.getFundProposalFee();
            return BigNumber.from(fundAmount)
                .mul(param.value)
                .div(param.multiple);
        } else {
            const param = await this.getSystemProposalFee();
            return param.value.div(param.multiple);
        }
    }

    public async *createProposal(
        proposalType: ProposalType,
        title: string,
        description: string,
        proposalId: BytesLike,
        fundAmount: BigNumberish,
        assessmentPeriod: number,
        votePeriod: number,
        documentId: BytesLike,
        systemType: SystemProposalType,
        params: ISystemProposalParam[]
    ): AsyncGenerator<CreateProposalStepValue> {
        yield {
            key: NormalSteps.PREPARED,
            proposalId
        };

        const fee = await this.getProposalFee(proposalType, fundAmount);
        const contract = this.getReceptionControllerWithSigner();
        let tx: ContractTransaction;
        let cr: ContractReceipt;
        try {
            tx = await contract.createProposal(
                {
                    proposalType,
                    title,
                    description,
                    proposalId,
                    fundAmount,
                    assessmentPeriod,
                    votePeriod,
                    documentId,
                    systemType,
                    params
                },
                { value: fee }
            );

            yield {
                key: NormalSteps.SENT,
                proposalId,
                txHash: tx.hash
            };
            cr = await tx.wait();
        } catch (error) {
            yield {
                key: NormalSteps.FAIL,
                proposalId
            };
            return;
        }

        const storage = this.getProposalStorage();
        const log = ContractUtils.findLog(cr, storage.interface, "UpdatedProposalPeriod");
        if (!log) {
            throw new ProposalCreationError();
        }

        yield {
            key: NormalSteps.DONE,
            proposalId
        };
    }

    private toIProposalData(res: any): IProposalData {
        return {
            proposalType: res.proposalType,
            title: res.title,
            description: res.description,
            proposer: res.proposer,
            proposalId: res.proposalId,
            fundAmount: res.fundAmount,
            documentId: res.documentId,
            beginAssess: res.beginAssess.toNumber(),
            endAssess: res.endAssess.toNumber(),
            beginVote: res.beginVote.toNumber(),
            endVote: res.endVote.toNumber(),
            systemType: res.systemType,
            params: res.params.map((m: ISystemProposalParam) => {
                return {
                    name: m.name,
                    value: m.value,
                    multiple: m.multiple
                };
            }),
            states: res.states,
            period: res.period,
            assessmentResult: res.assessmentResult,
            voteResult: res.voteResult,
            executionStates: res.executionStates,
            sendVoteCost: res.sendVoteCost
        };
    }

    public async getProposal(proposalId: BytesLike): Promise<IProposalData> {
        const res = await this.getReceptionController().getProposal(proposalId);
        return this.toIProposalData(res);
    }

    public async getProposalByIndex(idx: number, sortType: SortType): Promise<IProposalData> {
        const res = await this.getReceptionController().getProposalByIndex(idx, sortType);
        return this.toIProposalData(res);
    }

    public async getProposalList(startIndex: number, endIndex: number, sortType: SortType): Promise<IProposalData[]> {
        const res = await this.getReceptionController().getProposalList(startIndex, endIndex, sortType);
        return res.map((m) => this.toIProposalData(m));
    }

    public async *transition(proposalId: BytesLike): AsyncGenerator<TransitionStepValue> {
        yield {
            key: NormalSteps.PREPARED,
            proposalId
        };

        let tx: ContractTransaction;
        try {
            tx = await this.getReceptionControllerWithSigner().transition(proposalId);

            yield {
                key: NormalSteps.SENT,
                proposalId,
                txHash: tx.hash
            };

            await tx.wait();
        } catch (error) {
            yield {
                key: NormalSteps.FAIL,
                proposalId
            };
            return;
        }
        yield {
            key: NormalSteps.DONE,
            proposalId
        };
    }

    public async getProposalLength(): Promise<number> {
        return (await this.getReceptionController().getLength()).toNumber();
    }

    public async getStates(proposalId: BytesLike): Promise<ProposalStates> {
        return await this.getReceptionController().getStates(proposalId);
    }

    public async getPeriod(proposalId: BytesLike): Promise<ProposalPeriod> {
        return await this.getReceptionController().getPeriod(proposalId);
    }

    public async getPeriodToTransition(proposalId: BytesLike): Promise<ProposalPeriod> {
        return await this.getReceptionController().getPeriodToTransition(proposalId);
    }

    public async getVoteResult(proposalId: BytesLike): Promise<VoteResult> {
        const res = await this.getReceptionController().getProposal(proposalId);
        return res.voteResult;
    }

    public async getAssessmentResult(proposalId: BytesLike): Promise<VoteResult> {
        const res = await this.getReceptionController().getProposal(proposalId);
        return res.assessmentResult;
    }

    public async getExecutionStates(proposalId: BytesLike): Promise<VoteResult> {
        const res = await this.getReceptionController().getProposal(proposalId);
        return res.executionStates;
    }
    //--

    private getAssessmentStorage(): AssessmentStorage {
        const provider = this.web3.getProvider() as Provider;
        if (!provider) throw new NoProviderError();

        return AssessmentStorage__factory.connect(this.web3.getAssessmentStorageAddress(), provider);
    }

    private getAssessmentController(): AssessmentController {
        const provider = this.web3.getProvider() as Provider;
        if (!provider) throw new NoProviderError();

        return AssessmentController__factory.connect(this.web3.getAssessmentControllerAddress(), provider);
    }

    private getAssessmentControllerWithSigner(): AssessmentController {
        const signer = this.web3.getConnectedSigner();
        if (!signer) throw new NoSignerError();

        return AssessmentController__factory.connect(this.web3.getAssessmentControllerAddress(), signer);
    }

    public async getAssessmentSummary(proposalId: BytesLike): Promise<[number, number, number, number, number]> {
        const res = await this.getAssessmentController().getAssessmentSummary(proposalId);
        return [res[0].toNumber(), res[1].toNumber(), res[2].toNumber(), res[3].toNumber(), res[4].toNumber()];
    }

    public async *postScore(
        proposalId: BytesLike,
        items: [number, number, number, number, number]
    ): AsyncGenerator<AssessmentPostScoreStepValue> {
        yield {
            key: NormalSteps.PREPARED,
            proposalId
        };

        let tx: ContractTransaction;
        let cr: ContractReceipt;
        try {
            tx = await this.getAssessmentControllerWithSigner().postScore(proposalId, items);
            yield {
                key: NormalSteps.SENT,
                proposalId,
                txHash: tx.hash
            };

            cr = await tx.wait();
        } catch (error) {
            yield {
                key: NormalSteps.FAIL,
                proposalId
            };
            return;
        }
        const log = ContractUtils.findLog(cr, this.getAssessmentStorage().interface, "PostScore");
        if (!log) {
            throw new PostBallotError();
        }
        yield {
            key: NormalSteps.DONE,
            proposalId
        };
    }

    private toIAssessmentBallotData(res: any): IScoreData {
        return {
            voter: res.voter,
            timestamp: res.timestamp.toNumber(),
            items: [
                res.items[0].toNumber(),
                res.items[1].toNumber(),
                res.items[2].toNumber(),
                res.items[3].toNumber(),
                res.items[4].toNumber()
            ]
        };
    }

    private toICommentDataOfAssessment(res: any): ICommentData {
        return {
            writer: res.writer,
            timestamp: res.timestamp.toNumber(),
            message: res.message
        };
    }

    public async getScore(proposalId: BytesLike, voter: string): Promise<IScoreData> {
        const res = await this.getAssessmentController().getScore(proposalId, voter);
        return this.toIAssessmentBallotData(res);
    }

    public async getScoreList(
        proposalId: BytesLike,
        startIndex: number,
        endIndex: number,
        sortType: SortType
    ): Promise<IScoreData[]> {
        const res = await this.getAssessmentController().getScoreList(proposalId, startIndex, endIndex, sortType);
        return res.map((m) => this.toIAssessmentBallotData(m));
    }

    public async getScoreLength(proposalId: BytesLike): Promise<number> {
        return (await this.getAssessmentController().getScoreLength(proposalId)).toNumber();
    }

    public async *postComment(proposalId: BytesLike, message: string): AsyncGenerator<AssessmentPostCommentStepValue> {
        yield {
            key: NormalSteps.PREPARED,
            proposalId
        };

        let tx: ContractTransaction;
        let cr: ContractReceipt;
        try {
            tx = await this.getAssessmentControllerWithSigner().postComment(proposalId, message);
            yield {
                key: NormalSteps.SENT,
                proposalId,
                txHash: tx.hash
            };

            cr = await tx.wait();
        } catch (error) {
            yield {
                key: NormalSteps.FAIL,
                proposalId
            };
            return;
        }
        const log = ContractUtils.findLog(cr, this.getAssessmentStorage().interface, "PostComment");
        if (!log) {
            throw new PostCommentError();
        }
        yield {
            key: NormalSteps.DONE,
            proposalId
        };
    }

    public async getCommentList(
        proposalId: BytesLike,
        startIndex: number,
        endIndex: number,
        sortType: SortType
    ): Promise<ICommentData[]> {
        const res = await this.getAssessmentController().getCommentList(proposalId, startIndex, endIndex, sortType);
        return res.map((m) => this.toICommentDataOfAssessment(m));
    }

    public async getCommentLength(proposalId: BytesLike): Promise<number> {
        return (await this.getAssessmentController().getCommentLength(proposalId)).toNumber();
    }

    private getVoteStorage(): VoteStorage {
        const provider = this.web3.getProvider() as Provider;
        if (!provider) throw new NoProviderError();

        return VoteStorage__factory.connect(this.web3.getVoteStorageAddress(), provider);
    }

    private getVoteController(): VoteController {
        const provider = this.web3.getProvider() as Provider;
        if (!provider) throw new NoProviderError();

        return VoteController__factory.connect(this.web3.getVoteControllerAddress(), provider);
    }

    private getVoteControllerWithSigner(): VoteController {
        const signer = this.web3.getConnectedSigner();
        if (!signer) throw new NoSignerError();

        return VoteController__factory.connect(this.web3.getVoteControllerAddress(), signer);
    }

    public async getVoteSummary(proposalId: BytesLike): Promise<[number, number, number]> {
        const res = await this.getVoteController().getVoteSummary(proposalId);
        return [res[0].toNumber(), res[1].toNumber(), res[2].toNumber()];
    }

    public async *postBallot(proposalId: BytesLike, choice: Candidate): AsyncGenerator<VotePostBallotStepValue> {
        yield {
            key: NormalSteps.PREPARED,
            proposalId
        };

        let tx: ContractTransaction;
        let cr: ContractReceipt;
        try {
            tx = await this.getVoteControllerWithSigner().postBallot(proposalId, choice);
            yield {
                key: NormalSteps.SENT,
                proposalId,
                txHash: tx.hash
            };

            cr = await tx.wait();
        } catch (error) {
            yield {
                key: NormalSteps.FAIL,
                proposalId
            };
            return;
        }
        const log = ContractUtils.findLog(cr, this.getVoteStorage().interface, "PostBallot");
        if (!log) {
            throw new PostBallotError();
        }
        yield {
            key: NormalSteps.DONE,
            proposalId
        };
    }

    private toIVoteBallotData(res: any): IVoteBallotData {
        return {
            voter: res.voter,
            timestamp: res.timestamp.toNumber(),
            choice: res.choice
        };
    }

    public async getBallot(proposalId: BytesLike, voter: string): Promise<IVoteBallotData> {
        const res = await this.getVoteController().getBallot(proposalId, voter);
        return this.toIVoteBallotData(res);
    }

    public async getBallotList(
        proposalId: BytesLike,
        startIndex: number,
        endIndex: number,
        sortType: SortType
    ): Promise<IVoteBallotData[]> {
        const res = await this.getVoteController().getBallotList(proposalId, startIndex, endIndex, sortType);
        return res.map((m) => this.toIVoteBallotData(m));
    }

    public async getBallotLength(proposalId: BytesLike): Promise<number> {
        return (await this.getVoteController().getBallotLength(proposalId)).toNumber();
    }

    public async getVoterByIndex(proposalId: BytesLike, idx: number, sortType: SortType): Promise<string> {
        return await this.getVoteController().getVoterByIndex(proposalId, idx, sortType);
    }

    public async getVoterList(
        proposalId: BytesLike,
        startIndex: number,
        endIndex: number,
        sortType: SortType
    ): Promise<string[]> {
        return await this.getVoteController().getVoterList(proposalId, startIndex, endIndex, sortType);
    }

    public async getVoterLength(proposalId: BytesLike): Promise<number> {
        return (await this.getVoteController().getVoterLength(proposalId)).toNumber();
    }

    public async isVoter(proposalId: BytesLike, item: string): Promise<boolean> {
        return await this.getVoteController().isVoter(proposalId, item);
    }

    // --

    private getParamStorage(): ParamStorage {
        const provider = this.web3.getProvider() as Provider;
        if (!provider) throw new NoProviderError();

        return ParamStorage__factory.connect(this.web3.getParamStorageAddress(), provider);
    }

    public async getFundProposalFee(): Promise<IParamValue> {
        const res = await this.getParamStorage().getFundProposalFee();
        return {
            value: res.value,
            multiple: res.multiple
        };
    }

    public async getSystemProposalFee(): Promise<IParamValue> {
        const res = await this.getParamStorage().getSystemProposalFee();
        return {
            value: res.value,
            multiple: res.multiple
        };
    }
    public async getVoteQuorumFactor(): Promise<IParamValue> {
        const res = await this.getParamStorage().getVoteQuorumFactor();
        return {
            value: res.value,
            multiple: res.multiple
        };
    }

    public async getApprovalDiffPercent(): Promise<IParamValue> {
        const res = await this.getParamStorage().getApprovalDiffPercent();
        return {
            value: res.value,
            multiple: res.multiple
        };
    }

    public async getVoteCost(): Promise<IParamValue> {
        const res = await this.getParamStorage().getVoteCost();
        return {
            value: res.value,
            multiple: res.multiple
        };
    }

    public async getAssessmentAverage(): Promise<IParamValue> {
        const res = await this.getParamStorage().getAssessmentAverage();
        return {
            value: res.value,
            multiple: res.multiple
        };
    }

    public async getAssessmentIndividual(): Promise<IParamValue> {
        const res = await this.getParamStorage().getAssessmentIndividual();
        return {
            value: res.value,
            multiple: res.multiple
        };
    }
}
