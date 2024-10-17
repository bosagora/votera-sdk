import { Server } from "ganache";
import { GanacheServer } from "../helper/GanacheServer";
import {
    Amount,
    AssessmentResult,
    Candidate,
    Client,
    Context,
    ContractUtils,
    NormalSteps,
    ProposalPeriod,
    ProposalStates,
    ProposalType,
    SystemProposalType,
    VoteResult
} from "../../src";
import { Deployments } from "../helper/Deployments";

import { ParticipantManager } from "votera-contracts-lib";

describe("SDK Client - Vote", () => {
    const [, owner] = GanacheServer.accounts();
    let deployments: Deployments;
    let server: Server;
    let participantManager: ParticipantManager;
    let endAssessTimeStamp: number;
    let endVoteTimeStamp: number;

    const proposalData = {
        proposalType: ProposalType.FUND,
        proposer: "",
        title: "proposal1",
        description: "This is a sample proposal.\nFor more information, please refer to the document",
        proposalId: ContractUtils.getRandomId(),
        fundAmount: Amount.make(1000000, 18).value,
        assessmentPeriod: 7,
        votePeriod: 14,
        documentId: ContractUtils.getRandomId(),
        systemType: SystemProposalType.NORMAL,
        params: []
    };

    beforeAll(async () => {
        server = await GanacheServer.start();
        GanacheServer.setTestWeb3Signer(owner);
        deployments = new Deployments();
        await deployments.doDeployAll();
        participantManager = deployments.getContract("ParticipantManager") as ParticipantManager;
        proposalData.proposer = deployments.accounts.users[0].address;
    });

    afterAll(async () => {
        await server.close();
    });

    let client: Client;
    beforeAll(async () => {
        const ctx = new Context(deployments.getContextParams());
        client = new Client(ctx);
        client.useSigner(deployments.accounts.users[0]);
    });

    it("Web3 Health Checking", async () => {
        const isUp = await client.methods.web3.isUp();
        expect(isUp).toEqual(true);
    });

    it("addParticipant", async () => {
        await participantManager
            .connect(deployments.accounts.owner)
            .addParticipants(deployments.accounts.voters.map((m) => m.address));
    });

    it("createProposal", async () => {
        for await (const step of client.methods.createProposal(
            proposalData.proposalType,
            proposalData.title,
            proposalData.description,
            proposalData.proposalId,
            proposalData.fundAmount,
            proposalData.assessmentPeriod,
            proposalData.votePeriod,
            proposalData.documentId,
            proposalData.systemType,
            proposalData.params
        )) {
            switch (step.key) {
                case NormalSteps.PREPARED:
                    expect(step.proposalId).toEqual(proposalData.proposalId);
                    console.log(`NormalSteps.PREPARED ${step.proposalId}`);
                    break;
                case NormalSteps.SENT:
                    expect(step.proposalId).toEqual(proposalData.proposalId);
                    expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
                    console.log(`NormalSteps.SENT ${step.proposalId} - ${step.txHash}`);
                    break;
                case NormalSteps.DONE:
                    expect(step.proposalId).toEqual(proposalData.proposalId);
                    console.log(`NormalSteps.DONE ${step.proposalId}`);
                    break;
                case NormalSteps.FAIL:
                    console.error(`NormalSteps.FAIL ${step.proposalId}`);
                    break;
                default:
                    throw new Error("Unexpected step: " + JSON.stringify(step, null, 2));
            }
        }
        expect(await client.methods.getStates(proposalData.proposalId)).toEqual(ProposalStates.OPENED);
        expect(await client.methods.getPeriod(proposalData.proposalId)).toEqual(ProposalPeriod.ASSESSMENT);
        const data = await client.methods.getProposal(proposalData.proposalId);
        endAssessTimeStamp = data.endAssess;
        endVoteTimeStamp = data.endVote;
    });

    it("postScore", async () => {
        for (const voter of deployments.accounts.voters) {
            client.useSigner(voter);
            for await (const step of client.methods.postScore(proposalData.proposalId, [10, 10, 5, 5, 5])) {
                switch (step.key) {
                    case NormalSteps.PREPARED:
                        expect(step.proposalId).toEqual(proposalData.proposalId);
                        break;
                    case NormalSteps.SENT:
                        expect(step.proposalId).toEqual(proposalData.proposalId);
                        expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
                        break;
                    case NormalSteps.DONE:
                        expect(step.proposalId).toEqual(proposalData.proposalId);
                        break;
                    case NormalSteps.FAIL:
                        console.error(`NormalSteps.FAIL ${step.proposalId}`);
                        break;
                    default:
                        throw new Error("Unexpected step: " + JSON.stringify(step, null, 2));
                }
            }
        }
    });

    it("getAssessmentSummary", async () => {
        expect(await client.methods.getScoreLength(proposalData.proposalId)).toEqual(
            deployments.accounts.voters.length
        );
        const summary = await client.methods.getAssessmentSummary(proposalData.proposalId);
        expect(summary).toEqual([
            10 * deployments.accounts.voters.length,
            10 * deployments.accounts.voters.length,
            5 * deployments.accounts.voters.length,
            5 * deployments.accounts.voters.length,
            5 * deployments.accounts.voters.length
        ]);
    });

    it("postComment", async () => {
        for (const voter of deployments.accounts.voters) {
            client.useSigner(voter);
            for await (const step of client.methods.postComment(proposalData.proposalId, "message")) {
                switch (step.key) {
                    case NormalSteps.PREPARED:
                        expect(step.proposalId).toEqual(proposalData.proposalId);
                        break;
                    case NormalSteps.SENT:
                        expect(step.proposalId).toEqual(proposalData.proposalId);
                        expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
                        break;
                    case NormalSteps.DONE:
                        expect(step.proposalId).toEqual(proposalData.proposalId);
                        break;
                    case NormalSteps.FAIL:
                        console.error(`NormalSteps.FAIL ${step.proposalId}`);
                        break;
                    default:
                        throw new Error("Unexpected step: " + JSON.stringify(step, null, 2));
                }
            }
        }
    });

    it("Increase time to end of assessment + 10", async () => {
        await deployments.blockTimestampIncreaseTo(endAssessTimeStamp + 10);
    });

    it("transition", async () => {
        client.useSigner(deployments.accounts.users[0]);
        for await (const step of client.methods.transition(proposalData.proposalId)) {
            switch (step.key) {
                case NormalSteps.PREPARED:
                    expect(step.proposalId).toEqual(proposalData.proposalId);
                    console.log(`transition NormalSteps.PREPARED ${step.proposalId}`);
                    break;
                case NormalSteps.SENT:
                    expect(step.proposalId).toEqual(proposalData.proposalId);
                    expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
                    console.log(`transition NormalSteps.SENT ${step.proposalId} - ${step.txHash}`);
                    break;
                case NormalSteps.DONE:
                    expect(step.proposalId).toEqual(proposalData.proposalId);
                    console.log(`transition NormalSteps.DONE ${step.proposalId}`);
                    break;
                case NormalSteps.FAIL:
                    console.error(`transition NormalSteps.FAIL ${step.proposalId}`);
                    break;
                default:
                    throw new Error("Unexpected step: " + JSON.stringify(step, null, 2));
            }
        }

        expect(await client.methods.getStates(proposalData.proposalId)).toEqual(ProposalStates.OPENED);
        expect(await client.methods.getPeriod(proposalData.proposalId)).toEqual(ProposalPeriod.VOTE);
        expect(await client.methods.getAssessmentResult(proposalData.proposalId)).toEqual(AssessmentResult.APPROVED);
    });

    it("postBallot", async () => {
        const p = await client.methods.getVoteQuorumFactor();
        const q = Math.floor((deployments.accounts.voters.length * p.value.toNumber()) / p.multiple.toNumber()) + 1; // 34
        const ten = Math.floor(deployments.accounts.voters.length / 10); // 10
        const x = Math.floor((q + ten) / 2); // 22
        const y = Math.floor((q - ten) / 2); // 12

        expect([q, ten, x, y]).toEqual([34, 10, 22, 12]);
        for (let idx = 0; idx < deployments.accounts.voters.length; idx++) {
            const voter = deployments.accounts.voters[idx];
            client.useSigner(voter);
            let choice: Candidate = Candidate.BLANK;
            if (idx < x) {
                choice = Candidate.YES;
            } else if (x <= idx && idx < x + y) {
                choice = Candidate.NO;
            }
            if (choice !== Candidate.BLANK) {
                for await (const step of client.methods.postBallot(proposalData.proposalId, choice)) {
                    switch (step.key) {
                        case NormalSteps.PREPARED:
                            expect(step.proposalId).toEqual(proposalData.proposalId);
                            break;
                        case NormalSteps.SENT:
                            expect(step.proposalId).toEqual(proposalData.proposalId);
                            expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
                            break;
                        case NormalSteps.DONE:
                            expect(step.proposalId).toEqual(proposalData.proposalId);
                            break;
                        case NormalSteps.FAIL:
                            console.error(`NormalSteps.FAIL ${step.proposalId}`);
                            break;
                        default:
                            throw new Error("Unexpected step: " + JSON.stringify(step, null, 2));
                    }
                }
            }
        }
    });

    it("getVoteSummary", async () => {
        expect(await client.methods.getVoteSummary(proposalData.proposalId)).toEqual([0, 22, 12]);
    });

    it("Increase time to end of vote + 10", async () => {
        await deployments.blockTimestampIncreaseTo(endVoteTimeStamp + 10);
    });

    it("transition", async () => {
        client.useSigner(deployments.accounts.users[0]);
        for await (const step of client.methods.transition(proposalData.proposalId)) {
            switch (step.key) {
                case NormalSteps.PREPARED:
                    expect(step.proposalId).toEqual(proposalData.proposalId);
                    console.log(`transition NormalSteps.PREPARED ${step.proposalId}`);
                    break;
                case NormalSteps.SENT:
                    expect(step.proposalId).toEqual(proposalData.proposalId);
                    expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
                    console.log(`transition NormalSteps.SENT ${step.proposalId} - ${step.txHash}`);
                    break;
                case NormalSteps.DONE:
                    expect(step.proposalId).toEqual(proposalData.proposalId);
                    console.log(`transition NormalSteps.DONE ${step.proposalId}`);
                    break;
                case NormalSteps.FAIL:
                    console.error(`transition NormalSteps.FAIL ${step.proposalId}`);
                    break;
                default:
                    throw new Error("Unexpected step: " + JSON.stringify(step, null, 2));
            }
        }

        expect(await client.methods.getStates(proposalData.proposalId)).toEqual(ProposalStates.OPENED);
        expect(await client.methods.getPeriod(proposalData.proposalId)).toEqual(ProposalPeriod.EXECUTION);
        expect(await client.methods.getVoteResult(proposalData.proposalId)).toEqual(VoteResult.APPROVED);
    });
});
