import axios from "axios";

export function createOpenaiClient(option: {
  serverName: string;
  deployment: string;
  apiKey: string;
}) {
  const baseURL = `https://${option.serverName}.openai.azure.com/openai/deployments/${option.deployment}`;

  return axios.create({
    baseURL,
    headers: {
      "api-key": option.apiKey,
    },
  });
}

const serverName = "azure-openapi-test";
const apiKey = "9e93d7fdd5e74f64bcd22be09748652c";
const promptDeployment = "line-test";
const chatDeployment = "line-test";

export const OpenaiPromptClient = createOpenaiClient({
  serverName,
  deployment: promptDeployment,
  apiKey,
});

export const OpenaiChatClient = createOpenaiClient({
  serverName,
  deployment: chatDeployment,
  apiKey,
});
