import connectDB from "@/public/src/models/db";
import MyFileModel from "@/public/src/models/myFile";
import {
  getCompletion,
  getEmbeddings,
} from "@/public/src/models/openaiServices";
import { initializePinecone, pinecone } from "@/public/src/models/pinecone";

export default async function handle(req, res) {
  // 1. check if post call
  if (req.method !== "POST") {
    return res.status(400).json("invalid method");
  }

  const { id, query } = req.body;
  // 2. connect to mongodb
  await connectDB();
  // 3. query the model by id
  const myFile = await MyFileModel.findById(id);
  if (!myFile) {
    return res.status(400).json("invalid id");
  }
  // 4. get the embedding for the query
  const queryEmbedding = await getEmbeddings;
  // 5. initialize the pinecone
  await initializePinecone();
  // 6. connect the index
  const index = await pinecone.Index(myFile.vectorIndex);
  // 7. query the pinecone db
  const queryRequest = {
    vector: queryEmbedding,
    topK: 5,
    includeValues: true,
    includeMetadata: true,
  };
  const result = await index.query({ queryRequest });

  // get meta-data from pinecone results
  let contexts = result["matches"].map((item) => item["metadata"].text);
  contexts = contexts.join("\n\n--\n\n");
  // 8. build a prompt with actual query string and pinecone returned metadata
  const promptStart = "Answer the question based on the context below: \n\n";
  const promptEnd = `\n\nQuestion:${query} \n\nAnswer:`;

  const prompt = `${promptStart} ${contexts} ${promptEnd}`;
  // 9. get the completion from openAi and return the response
  let response = await getCompletion(prompt);
  return res.status(200).json({ response });
}
