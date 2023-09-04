"use server";

import { connectToDB } from "../mongoose";

import User from "../models/user.model";
import { revalidatePath } from "next/cache";

interface Params {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}
export async function updateUser({
  userId,
  username,
  name,
  bio,
  image,
  path,
}: Params): Promise<void> {
  try {
    connectToDB();
    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
      //upsert means updating and inserting
      {
        upsert: true,
      }
    );

    if (path === "/profile/edit") {
      //revalidate data associated with path
      revalidatePath(path);
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update user:${error.message}`);
  }
}

export async function fetchUser(userId: string) {
  try {
    connectToDB();
    return await User.findOne({ id: userId });
    // .populate({path:'communities',model:Communti});
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}
