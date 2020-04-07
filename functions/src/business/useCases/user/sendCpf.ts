import { GetUserIdFromTokenGateway } from "../../gateways/auth/autenticationGateway";
import {
  SendCpfUserGateway,
  GetEndpointsOrder,
} from "../../gateways/user/userGateway";
import CPF from "cpf-check";
import { getDate } from "../../../utils/getDate";
import { getOrderInfos } from "../../../utils/getOrderInfo";
export class SendCpfUserUC {
  constructor(
    private getUserIdFromTokenGateway: GetUserIdFromTokenGateway,
    private sendCpfUserGateway: SendCpfUserGateway,
    private getEndpointsOrder: GetEndpointsOrder,
    private useCaseOrder: string = "sendCpf"
  ) {}

  async execute(input: SendCpfUserUCInput): Promise<SendCpfUserUCOutput> {
    try {
      const userId = this.getUserIdFromTokenGateway.getUserIdFromToken(
        input.token
      );
      if (!CPF.validate(input.data)) {
        throw new Error(
          "CPF inválido ou não informado, conferir o numero informado"
        );
      }
      const date = getDate();
      const cpfFormated = CPF.format(input.data);
      const orderInfo = await getOrderInfos(
        this.getEndpointsOrder,
        userId,
        this.useCaseOrder
      );
      await this.sendCpfUserGateway.sendCpfUser(cpfFormated, userId, date);
      return {
        sucess: "true",
        nextEndpoint: orderInfo.nextEndpoint,
      };
    } catch (err) {
      throw new Error(err.message);
    }
  }
}

export interface SendCpfUserUCInput {
  token: string | undefined;
  data: string;
}

export interface SendCpfUserUCOutput {
  sucess: string;
  nextEndpoint: string;
}
