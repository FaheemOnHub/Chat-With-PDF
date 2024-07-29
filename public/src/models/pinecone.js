import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const pinecone = new Pinecone();

async function initializePinecone() {
  try {
    await pinecone.init({
      environment: process.env.PINECONE_INDEX_NAME,
      apiKey: process.env.PINECONE_API_KEY,
    });
  } catch (error) {
    console.error("Error initializing Pinecone:", error);
    throw error;
  }
}

export { pinecone, initializePinecone };
