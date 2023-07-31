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

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `HTML 코드를 보고 JSON 을 완성시켜 줘\n\n${html}\n\n{ \"IsPrivacyForm\": boolean,  \"PrivacyFields\": string[] }\n\nIsPrivacyForm 는 HTML 에 개인정보를 입력하는 요소가 있는지 유무, PrivacyFields는 개인정보 입력 요소가 있다면 어떤 값들을 요구하는지를 한국어로 나타내고 있어.`,
      },
    ],
    temperature: 1,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  try {
    const raw = response?.data?.choices[0]?.message?.content;
    const jsonStartIdx = raw.indexOf("{");
    const jsonEndIdx = raw.lastIndexOf("}");
    const obj = JSON.parse(raw.substring(jsonStartIdx, jsonEndIdx + 1));

    return {
      isPrivacyForm: obj.IsPrivacyForm,
      privacyFields: Array.isArray(obj.PrivacyFields) ? obj.PrivacyFields : [],
    };
  } catch (ex) {}

  throw new InvalidHTMLFormException();
}

export default validatePrivacyForm;
