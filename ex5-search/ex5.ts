import {
  Document,
  HuggingFaceEmbedding,
  Ollama,
  Settings,
  VectorStoreIndex,
} from "llamaindex";
import fs from "node:fs";
import path from "node:path";

Settings.llm = new Ollama({
  model: "llama3",
});

Settings.embedModel = new HuggingFaceEmbedding({
  modelType: "BAAI/bge-small-en-v1.5",
  quantized: false,
});

function readFilesInDirectory(directoryPath) {
  const files = fs.readdirSync(directoryPath);
  const fileContents = [];

  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    fileContents.push(fileContent);
  }

  return fileContents;
}

async function main() {
  // Load essay from abramov.txt in Node
  // const path = "./ex4-resume/profile.txt";

  // const essay = fs.readFileSync(path, "utf-8");
  const fileContents = readFilesInDirectory("./ex5-search/data");

  // Create Document object with essay
  // const document = new Document({ text: essay, id_: path });
  const documents = fileContents.map((file, i) => {
    return new Document({ text: file, id_: `${i}` });
  });

  // Split text and create embeddings. Store them in a VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments(documents);

  // Query the index
  const queryEngine = index.asQueryEngine();

  const response = await queryEngine.query({
    query: "Ответь по русски и кратко: Что такое Проблема relayout в Gameface",
  });

  // Output response
  console.log(response.toString());
  // console.log(JSON.stringify(response, null, 2));
}

main().catch(console.error);
