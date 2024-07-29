// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import connectDB from "@/public/src/models/db";
import uploadPDF from "@/public/src/models/cloudinary";
import slugify from "slugify";
import pinecone, { initializePinecone } from "@/public/src/models/pinecone";

export default async function handler(req, res) {
  if (req.method != "POST") {
    return res.status(400).json("method not allowed");
  }

  async function createPineconeIndex(indexName) {
    try {
      // Check if the index already exists
      const indexStatus = await pinecone.describeIndex(indexName);
      console.log(`Index "${indexName}" status:`, indexStatus);

      // If the index doesn't exist, create a new one
      if (indexStatus.status === "not found") {
        console.log(`Creating new index "${indexName}"...`);
        await pinecone.createIndex({
          name: indexName,
          dimension: 1536,
          spec: {
            serverless: {
              cloud: "aws",
              region: "us-west-2",
            },
          },
          waitUntilReady: true,
        });
        console.log(`Index "${indexName}" created successfully.`);
      } else {
        console.log(`Index "${indexName}" already exists.`);
      }
    } catch (error) {
      console.error("Error creating index:", error);
      throw error;
    }
  }

  try {
    await connectDB;

    //parse the incoming form data
    let form = new formidable.IncomingForm();
    form.parse(req, async (error, fields, files) => {
      if (error) {
        return res.status(500).json({ message: "failed to parse" });
      }
      const file = files.file;
      if (!file) return res.status(400).json("no file uploaded");
      let data = uploadPDF(file);
      const filename = file.name.split(".")[0];
      const fileSlug = slugify(filename, {
        lower: true,
        strict: true,
      });
      console.log(data);
      //initialize pinecone
      await initializePinecone();
      //create a index
      await createPineconeIndex(fileSlug);
      //save file in mongodb
      // const myFile = my MyFileModel({
      //   fileName:file.name,
      //   fileUrl:data,
      //   vectorIndex:fileSlug
      // })
      await myFile.save();
      return res.status(200).json("file uploaded to cloudinary");
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}
