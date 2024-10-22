import { ContractUtils } from "./ContractUtils";

export class ResponseMessage {
    static messages: Map<string, string> = new Map([
        ["0000", "Success"],
        ["1001", "The address entered is null"],
        ["1051", "Caller is not AssignmentController"],
        ["1052", "Caller is not ReceiptController"],
        ["1061", "Caller is not VoteController"],
        ["1054", "Caller is not Controller"],
        ["1061", "Caller is not PartisanManager"],
        ["1062", "Caller is not BudgetManager"],
        ["1063", "Caller is not Execution Manager"],
        ["1066", "Caller is not ProposalStorage"],
        ["1071", "Caller is not a component responsible for final execution"],
        ["1101", "No data exists corresponding to the input proposal ID"],
        ["1114", "Proposal is not in progress"],
        ["1103", "The proposal ID entered is null"],
        ["1104", "This is already a registered proposal ID"],
        ["1105", "The address of the wallet entered is null"],
        ["1106", "Not a business proposal; withdrawal is possible only upon approval of a business proposal"],
        ["1107", "Voting is not complete"],
        ["1108", "Already withdrawn"],
        ["1109", "The proposal is not about modifying the system parameters"],
        ["1110", "Wallet address of proposer is null"],
        ["1111", "Proposal type entered incorrectly"],
        ["1112", "Message sender does not have voting rights. Only validators can vote"],
        ["1113", "Message sender does not have permission to write a post. Only validators can write"],
        ["1114", "The index is out of array"],
        ["1115", "Assessment scores are not appropriate"],
        ["1116", "Vote choice are not appropriate"],
        ["1117", "Assessment period are not appropriate"],
        ["1118", "Vote period are not appropriate"],
        ["1201", "Proposal fee is not appropriate"],
        ["1301", "Proposal is not in progress"],
        ["1302", "Not a business proposal; withdrawal is possible only upon approval of a business proposal"],
        ["1303", "Voting is not complete"],
        ["1304", "Already withdrawn"],
        ["1305", "Only wallets with proposals can withdraw"]
    ]);

    public static getEVMErrorMessage(error: any): { code: number; error: any } {
        const code = ContractUtils.cacheEVMError(error);
        const message = ResponseMessage.messages.get(code);
        if (message !== undefined) {
            return { code: Number(code), error: { message } };
        }

        if (code !== "") {
            const defaultCode = "5000";
            const defaultMessage = code;
            if (defaultMessage !== undefined) {
                return { code: Number(defaultCode), error: { message: defaultMessage } };
            }
        } else if (ContractUtils.isErrorOfEVM(error)) {
            const defaultCode = "5000";
            const defaultMessage = error.reason ? error.reason : ResponseMessage.messages.get(defaultCode);
            if (defaultMessage !== undefined) {
                return { code: Number(defaultCode), error: { message: defaultMessage } };
            }
        } else if (error instanceof Error && error.message) {
            return { code: 9000, error: { message: error.message.substring(0, 64) } };
        }
        return { code: 9000, error: { message: "Unknown Error" } };
    }

    public static getErrorMessage(code: string, additional?: any): { code: number; error: any } {
        const message = ResponseMessage.messages.get(code);
        if (message !== undefined) {
            return { code: Number(code), error: { message, ...additional } };
        }
        return { code: 9000, error: { message: "Unknown Error" } };
    }
}
