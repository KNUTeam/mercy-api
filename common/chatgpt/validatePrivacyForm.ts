import { Configuration, OpenAIApi } from "openai";
import {
  InvalidHTMLFormException,
  OpenAIKeyNotValidException,
} from "../exceptions/ChatGPT.exception";

export interface ValidatePrivacyFormResult {
  isPrivacyForm: boolean;
  privacyFields: string[];
}

async function validatePrivacyForm(
  html: string
): Promise<ValidatePrivacyFormResult> {
  const { OPENAI_API_KEY } = process.env;
  if (!OPENAI_API_KEY) {
    throw new OpenAIKeyNotValidException();
  }

  const conf = new Configuration({
    apiKey: OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(conf);

  console.log([
    {
      role: "system",
      content: `{ \"IsPrivacyForm\": boolean,  \"PrivacyFields\": string[] }\n\n${html}\n\nHTML 보고 JSON 채워 줘, IsPrivacyForm 폼이 개인정보를 요구하는지 여부, PrivacyFields 요구한다면 어떤 값을 요구하는지\n`,
    },
  ]);

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `{ \"IsPrivacyForm\": boolean,  \"PrivacyFields\": string[] }\n\n${html}\n\nHTML 보고 JSON 채워 줘, IsPrivacyForm 폼이 개인정보를 요구하는지 여부, PrivacyFields 요구한다면 어떤 값을 요구하는지\n`,
      },
    ],
    temperature: 1,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  try {
    const raw = response?.data?.choices[0];
    console.log(raw);
    const obj = JSON.parse(raw.message.content);

    return {
      isPrivacyForm: obj.IsPrivacyForm,
      privacyFields: Array.isArray(obj.PrivacyFields) ? obj.PrivacyFields : [],
    };
  } catch (ex) {}

  throw new InvalidHTMLFormException();
}

export default validatePrivacyForm;
