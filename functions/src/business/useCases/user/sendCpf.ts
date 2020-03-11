import { GetUserIdFromTokenGateway } from "../../gateways/auth/autenticationGateway";
import { SendCpfUserGateway, GetEndpointsOrder } from "../../gateways/user/userGateway";
import moment from "moment";
import CPF from "cpf-check"
import { getOrderInfo } from "../../endpoinsInfo/endpoinsInfo";

export class SendCpfUserUC {
  constructor(
    private getUserIdFromTokenGateway: GetUserIdFromTokenGateway,
    private sendCpfUserGateway: SendCpfUserGateway,
    private getEndpointsOrder: GetEndpointsOrder,
    private useCaseOrder: string = "sendCpf"
  ) { }

  async execute(input: SendCpfUserUCInput): Promise<SendCpfUserUCOutput> {
    try {
      const userId = this.getUserIdFromTokenGateway.getUserIdFromToken(
        input.token
      );
      if (!CPF.validate(input.data)) {
        throw new Error("CPF inválido ou não informado, conferir o numero informado")
      }
      const date = moment().format("DD/MM/YYYY HH-mm-ss");
      const cpfFormated = CPF.format(input.data)
      const userOrdemFromDb = await this.getEndpointsOrder.getOrder(userId)
      const orderInfo = getOrderInfo(userOrdemFromDb, this.useCaseOrder)
      await this.sendCpfUserGateway.sendCpfUser(cpfFormated, userId, date);
      return {
        sucess: "true",
        nextEndpoint: orderInfo.nextEndpoint
      };
    } catch (err) {
      throw new Error(err.message)
    }
  }
}

export interface SendCpfUserUCInput {
  token: string;
  data: string;
}

export interface SendCpfUserUCOutput {
  sucess: string;
  nextEndpoint: string
}