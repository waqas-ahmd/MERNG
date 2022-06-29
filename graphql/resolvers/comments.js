import { UserInputError } from "apollo-server";
import Post from "../../models/Post.js";
import checkAuth from "../../utils/checkAuth.js";

const createComment = async (_, { postId, body }, context) => {
  const { username } = checkAuth(context);
  if (body.trim() === "") {
    throw new UserInputError("Empty comment", {
      errors: {
        body: "Comment must not be empty",
      },
    });
  }

  const post = await Post.findById(postId);

  if (post) {
    post.comments.unshift({
      body,
      username,
      createdAt: new Date().toISOString(),
    });
    await post.save();
    return post;
  } else {
    throw new UserInputError("Post not found");
  }
};

const deleteComment = async (_, { postId, commentId }, context) => {
  const { username } = checkAuth(context);
  const post = await Post.findById(postId);

  if (post) {
    const commentIndex = post.comments.findIndex((c) => c.id === commentId);
    if (commentIndex === -1) {
      throw new UserInputError("Comment not found");
    }

    if (post.comments[commentIndex].username === username) {
      post.comments.splice(commentIndex, 1);
      await post.save();
      return post;
    } else {
      throw new AuthenticationError("Action not allowed");
    }
  } else {
    throw new UserInputError("Post not found");
  }
};

export default {
  Query: {},
  Mutation: { createComment, deleteComment },
};
