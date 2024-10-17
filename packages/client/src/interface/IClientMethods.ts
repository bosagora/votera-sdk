import { IClientCore } from "../client-common";
import { BytesLike } from "@ethersproject/bytes";
import {
    AssessmentPostScoreStepValue,
    AssessmentPostCommentStepValue,
    Candidate,
    CreateProposalStepValue,
    IScoreData,
    ICommentData,
    IProposalData,
    ISystemProposalParam,
    IVoteBallotData,
    ProposalPeriod,
    ProposalStates,
    ProposalType,
    SortType,
    SystemProposalType,
    TransitionStepValue,
    VotePostBallotStepValue,
    VoteResult,
    IParamValue
} from "../interfaces";
import { BigNumberish } from "@ethersproject/bignumber";

export interface IClient {
    methods: IClientMethods;
}

export interface IClientMethods extends IClientCore {
    getAccount: () => Promise<string>;
    isAvailableProposalId: (proposalId: BytesLike) => Promise<boolean>;

    createProposal: (
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
    ) => AsyncGenerator<CreateProposalStepValue>;

    getProposal: (proposalId: BytesLike) => Promise<IProposalData>;
    getProposalByIndex: (idx: number, sortType: SortType) => Promise<IProposalData>;
    getProposalList: (startIndex: number, endIndex: number, sortType: SortType) => Promise<IProposalData[]>;
    getProposalLength: () => Promise<number>;

    transition: (proposalId: BytesLike) => AsyncGenerator<TransitionStepValue>;
    getStates: (proposalId: BytesLike) => Promise<ProposalStates>;
    getPeriod: (proposalId: BytesLike) => Promise<ProposalPeriod>;
    getPeriodToTransition: (proposalId: BytesLike) => Promise<ProposalPeriod>;
    getVoteResult: (proposalId: BytesLike) => Promise<VoteResult>;
    getAssessmentResult: (proposalId: BytesLike) => Promise<VoteResult>;
    getExecutionStates: (proposalId: BytesLike) => Promise<VoteResult>;
    //---

    getAssessmentSummary: (proposalId: BytesLike) => Promise<[number, number, number, number, number]>;
    postScore: (
        proposalId: BytesLike,
        items: [number, number, number, number, number]
    ) => AsyncGenerator<AssessmentPostScoreStepValue>;
    getScore: (proposalId: BytesLike, voter: string) => Promise<IScoreData>;
    getScoreList: (
        proposalId: BytesLike,
        startIndex: number,
        endIndex: number,
        sortType: SortType
    ) => Promise<IScoreData[]>;
    getScoreLength: (proposalId: BytesLike) => Promise<number>;
    postComment: (proposalId: BytesLike, message: string) => AsyncGenerator<AssessmentPostCommentStepValue>;
    getCommentList: (
        proposalId: BytesLike,
        startIndex: number,
        endIndex: number,
        sortType: SortType
    ) => Promise<ICommentData[]>;
    getCommentLength: (proposalId: BytesLike) => Promise<number>;
    //---

    getVoteSummary: (proposalId: BytesLike) => Promise<[number, number, number]>;
    postBallot: (proposalId: BytesLike, choice: Candidate) => AsyncGenerator<VotePostBallotStepValue>;
    getBallot: (proposalId: BytesLike, voter: string) => Promise<IVoteBallotData>;
    getBallotList: (
        proposalId: BytesLike,
        startIndex: number,
        endIndex: number,
        sortType: SortType
    ) => Promise<IVoteBallotData[]>;
    getBallotLength: (proposalId: BytesLike) => Promise<number>;
    getVoterByIndex: (proposalId: BytesLike, idx: number, sortType: SortType) => Promise<string>;
    getVoterList: (
        proposalId: BytesLike,
        startIndex: number,
        endIndex: number,
        sortType: SortType
    ) => Promise<string[]>;
    getVoterLength: (proposalId: BytesLike) => Promise<number>;
    isVoter: (proposalId: BytesLike, item: string) => Promise<boolean>;
    // --

    getFundProposalFee: () => Promise<IParamValue>;
    getSystemProposalFee: () => Promise<IParamValue>;
    getVoteQuorumFactor: () => Promise<IParamValue>;
    getApprovalDiffPercent: () => Promise<IParamValue>;
    getVoteCost: () => Promise<IParamValue>;
    getAssessmentAverage: () => Promise<IParamValue>;
    getAssessmentIndividual: () => Promise<IParamValue>;
}
