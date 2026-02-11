import { asyncHandler } from "../middlewares/asyncHandler.js";
import {
  registerUserService,
  loginUserService,
  getProfileService
} from "../services/userService.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { userId } = await registerUserService(req.validated.body);
  return res.status(201).json({ message: "User created", userId });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { token } = await loginUserService(req.validated.body);
  return res.json({ token });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await getProfileService(req.userId);
  return res.json(user);
});
