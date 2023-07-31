import { HttpStatusCode } from "axios";
import HttpException from "./HttpException";

export class OpenAIKeyNotValidException extends Error {
  constructor() {
    super("OpenAI Key is not valid.");
  }
}

export class InvalidHTMLFormException extends HttpException {
  constructor() {
    super(HttpStatusCode.BadRequest, "HTML form is not valid.");
  }
}
