import { AuthenticationError, UserInputError } from "apollo-server";
import Post from "../../models/Post.js";
import checkAuth from "../../utils/checkAuth.js";

const getPosts = async () => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    return posts;
  } catch (error) {
    throw new Error(error);
  }
};

const getPost = async (_, { postId }) => {
  try {
    const post = await Post.findById(postId.toString());
    if (post) return post;
    else {
      throw new Error("Post Not Found");
    }
  } catch (error) {
    throw new Error(error);
  }
};

const createPost = async (_, { body }, context) => {
  const user = checkAuth(context);
  if (body.trim() === "") {
    throw new UserInputError("Post body must not be empty");
  }
  const newPost = new Post({
    body,
    user: user.id,
    username: user.username,
    createdAt: new Date().toISOString(),
  });

  const post = await newPost.save();

  context.pubsub.publish("NEW_POST", {
    newPost: post,
  });
  return post;
};

const deletePost = async (_, { postId }, context) => {
  const user = checkAuth(context);
  try {
    const post = await Post.findById(postId);
    if (user.username === post.username) {
      await post.delete();
      return "Post deleted Successfully";
    } else {
      throw new AuthenticationError("Action not allowed");
    }
  } catch (error) {
    throw new Error(error);
  }
};

const likePost = async (_, { postId }, context) => {
  const { username } = checkAuth(context);
  const post = await Post.findById(postId);
  if (post) {
    if (post.likes.find((like) => like.username === username)) {
      post.likes = post.likes.filter((like) => like.username !== username);
    } else {
      post.likes.push({
        username,
        createdAt: new Date().toISOString(),
      });
    }

    await post.save();
    return post;
  } else throw new UserInputError("Post not found");
};

const newPost = {
  subscribe: (_, __, { pubsub }) => pubsub.asyncIterator("NEW_POST"),
};

export default {
  Query: { getPosts, getPost },
  Mutation: { createPost, deletePost, likePost },
  Subscription: { newPost },
};
