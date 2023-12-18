import axios from "axios";

export function createSearchClient(option: {
  serverName: string;
  indexesName: string;
  apiKey: string;
}) {
  const baseURL = `https://${option.serverName}.search.windows.net/indexes/${option.indexesName}/docs?$count=true&api-version=2020-06-30`;

  return axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      "api-key": option.apiKey,
    },
  });
}

const serverName = "mtel-openai-search";
const apiKey = "9e93d7fdd5e74f64bcd22be09748652c";
const indexesName = "azureblob-index2";

export const SearchClient = createSearchClient({
  serverName,
  indexesName,
  apiKey,
});
