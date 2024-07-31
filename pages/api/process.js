const { default: connectDB } = require("@/public/src/models/db");
const { default: MyFileModel } = require("@/public/src/models/myFile");
const { getEmbeddings } = require("@/public/src/models/openaiServices");
const {
  pinecone,
  initializePinecone,
} = require("@/public/src/models/pinecone");
const PDFJS = require("pdfjs-dist/legacy/build/pdf");

if (req.method !== "POST") {
  return res.status(400).json("invalid request");
}

try {
  await connectDB;
  const { id } = req.body;
  const myFile = await MyFileModel.findById(id);
  if (!myFile) {
    return res.status(400).json("invalid file");
  }
  if (myFile.isProcessed) {
    return res.status(400).json("file is already processed");
  }
  // read the pdf file from cloudinary and iterate through each page
  let vectors = [];
  let pdfDoc = await PDFJS.getDocument(myFileData.url).promise;
  if (myFile.ok) {
    let pdfDoc = await PDFJS.getDocument();

    const numPages = pdfDoc.numPages;
    for (let i = 0; i < numPages; i++) {
      let page = await pdfDoc.getPage(i + 1);
      let textContent = await page.getTextContent();
      const text = textContent.items.map((item) => item.str).join("");

      //get embeddings
      const embedding = await getEmbeddings(text);
      //create a array named vector and push our vectors in that array
      vectors.push({
        id: `page${i + 1}`,
        values: embedding,
        metadata: {
          text,
          pageNum: i + 1,
        },
      });
    }
    //7. initialize pinecone
    await initializePinecone();
    //8. connect to the index
    const index = pinecone.Index(myFile.vectorIndex);
    //9. upsert method
    await index.upsert({
      upsertRequest: {
        vectors,
      },
    });
    //10. update mongodb is processed to true
    myFile.isProcessed = true;
    await myFile.save();

    return res.status(200).json("file is processed sucessfully");
  } else {
    return res.status(500).json("error getting the file");
  }
} catch (error) {}
