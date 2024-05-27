import ollama from "ollama";

const modelfile = `
FROM llama3
PARAMETER temperature 0
SYSTEM """
You are a translator of technical documentation from English 
into Russian. Variable names in single quotes do not need 
to be translated, source code in triple quotes does not need 
to be translated."
`;

await ollama.create({ model: "translator", modelfile: modelfile });

import fs from "fs";

const docPath = "./ex2-translate/doc.md";
const docAsBase64 = fs.readFileSync(docPath, "utf8");

const response = await ollama.generate({
  model: "llama3",
  prompt: "Переведи эту документацию на русский язык: " + docAsBase64,
  stream: true,
});
for await (const part of response) {
  process.stdout.write(part.response);
}
process.stdout.write("\n\n");
