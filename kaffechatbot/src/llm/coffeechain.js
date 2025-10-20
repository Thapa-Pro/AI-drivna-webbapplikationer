import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import { ChatOllama } from "@langchain/community/chat_models/ollama";

export const OLLAMA_BASE_URL = "/ollama";
export const OLLAMA_MODEL = "llama3.2:latest";

export function makeModel() {
  return new ChatOllama({
    baseUrl: OLLAMA_BASE_URL,
    model: OLLAMA_MODEL,
    temperature: 0.2,
  });
}

export function makeMemory() {
  return new BufferMemory({
    memoryKey: "history",
    returnMessages: true,
  });
}

export function makeCoffeeChain({ model, memory }) {
  // NOTE: only one variable: {input}
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "Du är en barista-assistent. Svara på svenska. " +
        "Använd ENDAST menyn jag skickar i samma meddelande som källa för priser/produkter. " +
        "Om något saknas i menyn: säg att du inte vet. Var kort och konkret."
    ],
    new MessagesPlaceholder("history"),
    ["human", "{input}"],
  ]);

  return new ConversationChain({
    llm: model,
    memory,
    prompt,              // ConversationChain expects one key: 'input'
    inputKey: "input",   // (explicit for clarity)
  });
}
