import mongoose from "mongoose";

let isConnected = false;

export const connectToDB = async () => {
  //to proctect unknown field query
  mongoose.set("strictQuery", true);

  if (!process.env.MONGODB_URL) return console.log("Mongo DB URl not found");
  if (isConnected) {
    console.log("Already connected to mongoDB");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URL);
    isConnected = true;
    console.log("Connected To mongodb");
  } catch (error) {
    console.log(error);
  }
};
