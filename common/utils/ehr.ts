import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { HttpStatusCode } from "axios";
import HttpException from "../exceptions/HttpException";

function ehr<T, R>(
  service: (dto: T, context: Context, req: HttpRequest) => Promise<R>,
  dtoGen?: (req: HttpRequest) => Promise<T>
): AzureFunction {
  return async function (context: Context, req: HttpRequest) {
    let dto: T;
    let res: any = {
      headers: {
        "Content-Type": "application/json", // Set the Content-Type header
      },
    };

    if (dtoGen) {
      try {
        dto = await dtoGen(req);
      } catch (ex) {
        res.status = HttpStatusCode.BadRequest;
        res.body = ex;
        context.res = res;
        return;
      }
    }

    try {
      const out = await service(dto, context, req);
      res.status = HttpStatusCode.Ok;
      res.body = out;
    } catch (ex) {
      if (ex instanceof HttpException) {
        res.status = ex.httpCode;
        res.body = ex.message;
      } else {
        res.status = HttpStatusCode.InternalServerError;
      }
    }

    context.res = res;
    console.log(context.res);
  };
}

export default ehr;
