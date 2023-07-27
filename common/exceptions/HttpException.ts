class HttpException extends Error {
  constructor(public httpCode: number, public message: string) {
    super();
  }
}

export default HttpException;
