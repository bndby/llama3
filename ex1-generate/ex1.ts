import { Ollama } from "ollama";

const ollama = new Ollama({ host: "http://localhost:11434" });

const response = await ollama.generate({
  model: "llama3",
  prompt: "draw a green circle on a blue background in svg format",
  stream: true,
});
for await (const part of response) {
  process.stdout.write(part.response);
}
process.stdout.write("\n\n");
