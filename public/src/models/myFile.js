import mongoose, { mongo } from "mongoose";
const Schema = mongoose.Schema;

const myFileSchema = new Schema(
  {
    filename: {
      type: String,
      required: ["true", "a file must have a name"],
      maxLength: 100,
      unique: true,
    },
    fileUrl: {},
    isProcessed: {
      type: Boolean,
      default: false,
    },
    vectorIndex: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const MyFileModel = mongoose.model("myFile", myFileSchema);
export default MyFileModel;
