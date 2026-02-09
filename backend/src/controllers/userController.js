import { prisma } from "../server.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Registro
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    });

    return res.status(201).json({ message: "User created", userId: user.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error registering user" });
  }
};

// Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    return res.json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error logging in" });
  }
};

// Perfil
export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true }
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching profile" });
  }
};
