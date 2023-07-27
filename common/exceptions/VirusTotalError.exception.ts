import HttpException from "./HttpException";

class VirusTotalErrorException extends HttpException {
  constructor() {
    super(500, "Failed to fetch virustotal API.");
  }
}

export default VirusTotalErrorException;
