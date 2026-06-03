import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    avatar: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    watchlist: [
      {
        movieId: Number,
        title: String,
        poster: String,
        addedAt: { type: Date, default: Date.now },
      },
    ],
    refreshToken: {
      type: String,
      default: "",
    },
    isVerified: {
  type: Boolean,
  default: false,
},
verificationToken: {
  type: String,
  default: "",
},
verificationExpires: {
  type: Date,
},
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
  // Only hash if password is being modified AND it's not already hashed
  if (!this.isModified("password")) return;
  // If it's already a bcrypt hash (starts with $2b$), skip
  if (this.password.startsWith("$2b$")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;