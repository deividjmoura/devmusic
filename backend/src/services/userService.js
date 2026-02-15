import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import { AppError } from "../utils/appError.js";

const isMissingOnboardingColumnError = (error) =>
  error?.code === "P2022" && String(error?.meta?.column || "").includes("onboardingCompleted");

export const registerUserService = async ({ name, email, password }) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true }
  });

  if (existingUser) {
    throw new AppError(400, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
    select: { id: true }
  });

  return { userId: user.id };
};

export const loginUserService = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, password: true }
  });

  if (!user) {
    throw new AppError(400, "User not found");
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new AppError(400, "Invalid password");
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1d"
  });

  return { token };
};

export const getProfileService = async (userId) => {
  let user;

  try {
    user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, onboardingCompleted: true }
    });
  } catch (error) {
    if (!isMissingOnboardingColumnError(error)) {
      throw error;
    }

    user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true }
    });

    if (user) {
      user = { ...user, onboardingCompleted: false };
    }
  }

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return user;
};
