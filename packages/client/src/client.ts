import { ClientCore, Context } from "./client-common";
import { VoteMethods } from "./internal/client/VoteMethods";
import { AssessmentMethods } from "./internal/client/AssessmentMethods";
import { ReceptionMethods } from "./internal/client/ReceptionMethods";
import { IVote, IVoteMethods } from "./interface/IVote";
import { IAssessment, IAssessmentMethods } from "./interface/IAssessment";
import { IReception, IReceptionMethods } from "./interface/IReception";

export class Client extends ClientCore implements IVote, IAssessment, IReception {
    private readonly privateAssessment: IAssessmentMethods;
    private readonly privateReception: IReceptionMethods;
    private readonly privateVote: IVoteMethods;

    constructor(context: Context) {
        super(context);
        this.privateAssessment = new AssessmentMethods(context);
        this.privateReception = new ReceptionMethods(context);
        this.privateVote = new VoteMethods(context);
        Object.freeze(Client.prototype);
        Object.freeze(this);
    }

    public usePrivateKey(privateKey: string): void {
        this.web3.usePrivateKey(privateKey);
        this.privateVote.web3.usePrivateKey(privateKey);
    }

    public get vote(): IVoteMethods {
        return this.privateVote;
    }

    public get assessment(): IAssessmentMethods {
        return this.privateAssessment;
    }

    public get reception(): IReceptionMethods {
        return this.privateReception;
    }
}
