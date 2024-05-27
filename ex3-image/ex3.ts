import { Ollama } from "ollama";
import fs from "fs";

const imagePath = "./ex3-image/cat2.jpg";
const imageAsBase64 = fs.readFileSync(imagePath, "base64");

const ollama = new Ollama({ host: "http://localhost:11434" });

const response = await ollama.generate({
  model: "llama3",
  prompt:
    "Ответь одним словом и по русски, какое животное на этой base64 картинке: " +
    imageAsBase64,
  stream: true,
});
for await (const part of response) {
  process.stdout.write(part.response);
}
process.stdout.write("\n\n");
