import mongoose from "mongoose";

const pendingUserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verificationToken: { type: String, required: true },
  expiresAt: { type: Date, required: true, expires: 0 }, // auto-delete when expired
});

const PendingUser = mongoose.model("PendingUser", pendingUserSchema);
export default PendingUser;