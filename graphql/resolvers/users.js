import User from "../../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config.js";
import { UserInputError } from "apollo-server";
import {
  validateLoginInput,
  validateRegisterInput,
} from "../../utils/validation.js";

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    JWT_SECRET,
    { expiresIn: "72h" }
  );
}

const login = async (_, { username, password }) => {
  const { valid, errors } = validateLoginInput(username, password);
  const user = await User.findOne({ username });

  if (!valid) {
    throw new UserInputError("Errors", { errors });
  }

  if (!user) {
    errors.general = "User Not Found";
    throw new UserInputError("Wrong Credentials", { errors });
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    errors.general = "Incorrect Password";
    throw new UserInputError("Wrong Credentials", { errors });
  }

  const token = generateToken(user);
  return { ...user._doc, id: user._id, token };
};

const register = async (_, { username, email, password, confirmPassword }) => {
  const { valid, errors } = validateRegisterInput(
    username,
    email,
    password,
    confirmPassword
  );
  if (!valid) {
    throw new UserInputError("Errors", { errors });
  }
  const user = await User.findOne({ username });
  if (user) {
    throw new UserInputError("Username is Taken", {
      errors: {
        username: "This Username is Taken",
      },
    });
  }

  password = await bcrypt.hash(password, 12);

  const newUser = new User({
    username,
    password,
    email,
    createdAt: new Date().toISOString(),
  });

  const res = await newUser.save();

  const token = generateToken(res);

  return { ...res._doc, id: res._id, token };
};

export default {
  Query: {},
  Mutation: { login, register },
};
