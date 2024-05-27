import {
  Document,
  HuggingFaceEmbedding,
  Ollama,
  Settings,
  VectorStoreIndex,
} from "llamaindex";
import fs from "node:fs";

Settings.llm = new Ollama({
  model: "llama3",
});

Settings.embedModel = new HuggingFaceEmbedding({
  modelType: "BAAI/bge-small-en-v1.5",
  quantized: false,
});

async function main() {
  // Load essay from abramov.txt in Node
  const path = "./ex4-resume/profile.txt";

  const essay = fs.readFileSync(path, "utf-8");

  // Create Document object with essay
  const document = new Document({ text: essay, id_: path });

  // Split text and create embeddings. Store them in a VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments([document]);

  // Query the index
  const queryEngine = index.asQueryEngine();

  const response = await queryEngine.query({
    query:
      "Ответь по русски и кратко, сколько лет опыта у кандидата и сможет ли он работать врачом?",
  });

  // Output response
  console.log(response.toString());
}

main().catch(console.error);
