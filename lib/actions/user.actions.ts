"use server";

import { connectToDB } from "../mongoose";

import User from "../models/user.model";
import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import { FilterQuery, SortOrder } from "mongoose";

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

export async function fetchUserPosts(userId: string) {
  try {
    connectToDB();

    //find all the thread authored by the user with the given id

    //TODO: populate the community

    const threads = await User.findOne({ id: userId }).populate({
      path: "threads",
      model: Thread,
      populate: {
        path: "children",
        model: Thread,
        populate: {
          path: "author",
          model: User,
          select: "name image id",
        },
      },
    });

    return threads;
  } catch (error: any) {
    throw new Error(`Failed to fetch user posts:${error.message}`);
  }
}

export async function fetchUsers({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    connectToDB();

    const skipAmount = (pageNumber - 1) * pageSize;

    //case insenstive regex i means insensitive
    const regex = new RegExp(searchString, "i");

    //initial query to get the user
    const query: FilterQuery<typeof User> = {
      //filterout the current user
      id: { $ne: userId },
    };

    //if search string exists

    if (searchString.trim() !== "") {
      // appending the query
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    const sortOptions = {
      createdAt: sortBy,
    };

    const usersQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    const totalUsersCount = await User.countDocuments(query);

    const users = await usersQuery.exec();

    const isNext = totalUsersCount > skipAmount + users.length;

    return { users, isNext };
  } catch (error: any) {
    throw new Error(`Failed to fetch the users : ${error.message}`);
  }
}

export async function getActivity(userId: string) {
  try {
    connectToDB();

    //find all the threads created by user
    const userThreads = await Thread.find({ author: userId });

    //collect all the child threads ids (replies) from the children fields
    const childThreadIds = userThreads.reduce((acc, userThread) => {
      return acc.concat(userThread.children);
    }, []);

    //getting the replies excluding that created by the same user
    const replies = await Thread.find({
      _id: { $in: childThreadIds },
      author: { $ne: userId },
    }).populate({
      path: "author",
      model: User,
      select: "name,image _id",
    });

    return replies;
  } catch (error: any) {
    throw new Error(`Failed to fetch the activity : ${error.message}`);
  }
}
