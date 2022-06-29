import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";
import { AuthenticationError } from "apollo-server";
export default (context) => {
  const authHeader = context.req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split("Bearer ")[1];
    if (token) {
      try {
        const user = jwt.verify(token, JWT_SECRET);
        return user;
      } catch (error) {
        throw new AuthenticationError("Invalid/Expired Token");
      }
    }
    throw new Error("Authentication token must be 'Bearer [token]'");
  }
  throw new Error("Authentication Header must be provided");
};
