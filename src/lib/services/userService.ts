import "server-only";
import { connectDB } from "@/src/lib/mongodb";
import User from "@/src/models/user";
import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function registerUser(name: string, email: string, password: string) {
  await connectDB();
  const existing = await User.findOne({ email: email.toLowerCase() }).lean();
  if (existing) throw new Error("Email already registered");
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashPassword(password),
  });
  return { id: String(user._id), name: user.name, email: user.email };
}

export async function loginUser(email: string, password: string) {
  await connectDB();
  const user = await User.findOne({
    email: email.toLowerCase(),
    password: hashPassword(password),
    isActive: true,
  }).lean() as any;
  if (!user) throw new Error("Invalid email or password");
  return { id: String(user._id), name: user.name, email: user.email, role: user.role || "customer" };
}

export async function getUserById(id: string) {
  await connectDB();
  const user = await User.findById(id).lean() as any;
  if (!user) throw new Error("User not found");
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    role: user.role || "customer",
    address: user.address || {},
    createdAt: user.createdAt,
  };
}

export async function updateUserProfile(
  id: string,
  updates: { name?: string; phone?: string; address?: object }
) {
  await connectDB();
  const user = await User.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  ).lean() as any;
  if (!user) throw new Error("User not found");
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    role: user.role || "customer",
    address: user.address || {},
  };
}

export async function changePassword(id: string, currentPassword: string, newPassword: string) {
  await connectDB();
  const user = await User.findOne({ _id: id, password: hashPassword(currentPassword) });
  if (!user) throw new Error("Current password is incorrect");
  user.password = hashPassword(newPassword);
  await user.save();
  return { success: true };
}

export async function createPasswordResetToken(email: string): Promise<string> {
  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase(), isActive: true });
  if (!user) throw new Error("No account found with that email address");

  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  user.resetToken = token;
  user.resetTokenExpiry = expiry;
  await user.save();

  return token;
}

export async function resetPasswordWithToken(token: string, newPassword: string) {
  await connectDB();
  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: new Date() },
  });
  if (!user) throw new Error("Reset link is invalid or has expired");

  user.password = hashPassword(newPassword);
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  return { success: true, email: user.email };
}

export async function validateResetToken(token: string): Promise<boolean> {
  await connectDB();
  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: new Date() },
  });
  return !!user;
}

// ─── OTP-based password reset ───────────────────────────────────────────────

export async function createOtpForEmail(email: string): Promise<{ otp: string; name: string }> {
  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase(), isActive: true });
  if (!user) throw new Error("No account found with that email address");

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  user.resetToken = `otp:${otp}`;
  user.resetTokenExpiry = expiry;
  await user.save();

  return { otp, name: user.name };
}

export async function verifyOtpAndGetResetToken(email: string, otp: string): Promise<string> {
  await connectDB();
  const user = await User.findOne({
    email: email.toLowerCase(),
    resetToken: `otp:${otp}`,
    resetTokenExpiry: { $gt: new Date() },
  });
  if (!user) throw new Error("Invalid or expired OTP");

  // Issue a single-use reset token valid for 15 minutes
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetToken = resetToken;
  user.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  return resetToken;
}
