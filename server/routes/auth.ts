import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { User, IUser } from "../models/User";
import { OTP, IOTP } from "../models/OTP";
import { sendOTPEmail, sendWelcomeEmail } from "../services/emailService";
import { verifyGoogleToken } from "../services/googleAuth";
import { isMongoConnected } from "../config/database";
import {
  inMemoryUsers,
  inMemoryOTPs,
  generateId,
  InMemoryUser,
  InMemoryOTP,
} from "../storage/inMemory";
import {
  SignupRequest,
  LoginRequest,
  AuthResponse,
  User as UserResponse,
  OTPRequest,
  VerifyOTPRequest,
  GoogleAuthRequest,
} from "@shared/api";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Helper functions
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Storage abstraction helpers
const findUserByEmail = async (
  email: string,
): Promise<IUser | InMemoryUser | null> => {
  if (isMongoConnected) {
    return await User.findOne({ email: email.toLowerCase() });
  } else {
    return (
      inMemoryUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase(),
      ) || null
    );
  }
};

const findUserById = async (
  id: string,
): Promise<IUser | InMemoryUser | null> => {
  if (isMongoConnected) {
    return await User.findById(id);
  } else {
    return inMemoryUsers.find((u) => u.id === id) || null;
  }
};

const createUser = async (
  userData: Partial<InMemoryUser>,
): Promise<IUser | InMemoryUser> => {
  if (isMongoConnected) {
    const newUser = new User(userData);
    return await newUser.save();
  } else {
    const newUser: InMemoryUser = {
      id: generateId(),
      email: userData.email!.toLowerCase(),
      name: userData.name!,
      password: userData.password,
      avatar: userData.avatar,
      authProvider: userData.authProvider || "local",
      googleId: userData.googleId,
      isEmailVerified: userData.isEmailVerified || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryUsers.push(newUser);
    return newUser;
  }
};

const saveOTP = async (
  email: string,
  otp: string,
  expiresAt: Date,
): Promise<void> => {
  if (isMongoConnected) {
    await OTP.deleteMany({ email: email.toLowerCase() });
    const newOTP = new OTP({ email: email.toLowerCase(), otp, expiresAt });
    await newOTP.save();
  } else {
    // Remove existing OTPs for this email
    for (let i = inMemoryOTPs.length - 1; i >= 0; i--) {
      if (inMemoryOTPs[i].email.toLowerCase() === email.toLowerCase()) {
        inMemoryOTPs.splice(i, 1);
      }
    }
    const newOTP: InMemoryOTP = {
      id: generateId(),
      email: email.toLowerCase(),
      otp,
      expiresAt,
      attempts: 0,
      isUsed: false,
      createdAt: new Date(),
    };
    inMemoryOTPs.push(newOTP);
  }
};

const findValidOTP = async (
  email: string,
  otp: string,
): Promise<IOTP | InMemoryOTP | null> => {
  if (isMongoConnected) {
    return await OTP.findOne({
      email: email.toLowerCase(),
      otp,
      expiresAt: { $gt: new Date() },
      isUsed: false,
    });
  } else {
    return (
      inMemoryOTPs.find(
        (o) =>
          o.email.toLowerCase() === email.toLowerCase() &&
          o.otp === otp &&
          o.expiresAt > new Date() &&
          !o.isUsed,
      ) || null
    );
  }
};

const markOTPAsUsed = async (otpDoc: IOTP | InMemoryOTP): Promise<void> => {
  if (isMongoConnected && "save" in otpDoc) {
    otpDoc.isUsed = true;
    otpDoc.attempts += 1;
    await otpDoc.save();
  } else {
    (otpDoc as InMemoryOTP).isUsed = true;
    (otpDoc as InMemoryOTP).attempts += 1;
  }
};

const createUserResponse = (user: IUser | InMemoryUser): UserResponse => ({
  id: "id" in user ? user.id : user._id.toString(),
  email: user.email,
  name: user.name,
  avatar: user.avatar,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const generateToken = (user: IUser | InMemoryUser): string => {
  const userId = "id" in user ? user.id : user._id.toString();
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
};

// Signup handler
export const handleSignup: RequestHandler = async (req, res) => {
  try {
    const { email, name, password }: SignupRequest = req.body;

    // Validation
    if (!email || !name || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Check if user exists
    const existingUser = await findUserByEmail(email.toLowerCase());
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await createUser({
      email: email.toLowerCase(),
      name,
      password: hashedPassword,
      authProvider: "local",
      isEmailVerified: true, // For demo purposes, set to true
    });

    // Send welcome email (async, don't wait)
    sendWelcomeEmail(newUser.email, newUser.name).catch(console.error);

    // Generate token
    const token = generateToken(newUser);

    const response: AuthResponse = {
      token,
      user: createUserResponse(newUser),
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Login handler
export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user
    const user = await findUserByEmail(email.toLowerCase());
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if user has a password (not OAuth user)
    if (!user.password) {
      return res
        .status(401)
        .json({
          message:
            "Please use the authentication method you originally signed up with",
        });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(user);

    const response: AuthResponse = {
      token,
      user: createUserResponse(user),
    };

    res.json(response);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Send OTP handler
export const handleSendOTP: RequestHandler = async (req, res) => {
  try {
    const { email }: OTPRequest = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP
    await saveOTP(email.toLowerCase(), otp, expiresAt);

    // Send OTP email
    const emailSent = await sendOTPEmail(email.toLowerCase(), otp);
    if (!emailSent) {
      console.log(`🔐 [DEV] OTP for ${email}: ${otp} (expires in 10 minutes)`);
    }

    res.json({ message: "OTP sent successfully to your email" });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Verify OTP handler
export const handleVerifyOTP: RequestHandler = async (req, res) => {
  try {
    const { email, otp }: VerifyOTPRequest = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Find valid OTP
    const otpDoc = await findValidOTP(email.toLowerCase(), otp);

    if (!otpDoc) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Check attempts
    if (otpDoc.attempts >= 5) {
      return res
        .status(400)
        .json({ message: "Too many attempts. Please request a new OTP" });
    }

    // Mark OTP as used
    await markOTPAsUsed(otpDoc);

    // Find or create user
    let user = await findUserByEmail(email.toLowerCase());

    if (!user) {
      // Create new user with OTP verification
      user = await createUser({
        email: email.toLowerCase(),
        name: email.split("@")[0], // Use email prefix as default name
        authProvider: "otp",
        isEmailVerified: true,
      });
    }

    // Generate token
    const token = generateToken(user);

    const response: AuthResponse = {
      token,
      user: createUserResponse(user),
    };

    res.json(response);
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Google Auth handler
export const handleGoogleAuth: RequestHandler = async (req, res) => {
  try {
    const { token: googleToken }: GoogleAuthRequest = req.body;

    if (!googleToken) {
      return res.status(400).json({ message: "Google token is required" });
    }

    // Verify Google token
    const googleUser = await verifyGoogleToken(googleToken);

    if (!googleUser) {
      return res.status(400).json({ message: "Invalid Google token" });
    }

    if (!googleUser.email_verified) {
      return res.status(400).json({ message: "Google email not verified" });
    }

    // Find or create user
    let user = await User.findOne({
      $or: [
        { email: googleUser.email.toLowerCase() },
        { googleId: googleUser.id },
      ],
    });

    if (!user) {
      user = new User({
        email: googleUser.email.toLowerCase(),
        name: googleUser.name,
        avatar: googleUser.picture,
        authProvider: "google",
        googleId: googleUser.id,
        isEmailVerified: true,
      });
      await user.save();

      // Send welcome email (async, don't wait)
      sendWelcomeEmail(user.email, user.name).catch(console.error);
    } else if (!user.googleId) {
      // Link existing account with Google
      user.googleId = googleUser.id;
      user.avatar = user.avatar || googleUser.picture;
      await user.save();
    }

    // Generate token
    const token = generateToken(user._id.toString());

    const response: AuthResponse = {
      token,
      user: createUserResponse(user),
    };

    res.json(response);
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Middleware to verify JWT token
export const verifyToken: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token =
    authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(decoded.userId)) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    (req as any).userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Get current user
export const handleGetUser: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).userId;
    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: createUserResponse(user) });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
