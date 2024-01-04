import axios from "axios";

interface FastGPTChatVariables {
  uid: string;
  name: string;
  chatId?: string;
}

interface ChatMessageItem {
  role: string;
  content: string;
}

interface ChoiceItem {
  message: ChatMessageItem;
  finish_reason: string;
  index: number;
}

interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}
interface FastGPTChatResponse {
  id: string;
  model: string;
  usage: Usage;
  choices: ChoiceItem[];
}

export async function fast_gpt_chat(
  variables: FastGPTChatVariables,
  messages: ChatMessageItem[]
) {
  const body = {
    chatId: variables.chatId,
    stream: false,
    detail: false,
    variables: {
      uid: variables.uid,
      name: variables.name,
    },
    messages: messages,
  };

  const res = await axios(`${process.env.fastgpt_baseurl}/chat/completions`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.fastgpt_apikey}`,
    },
    method: "POST",
    data: body,
  });
  return res.data as FastGPTChatResponse;
}
