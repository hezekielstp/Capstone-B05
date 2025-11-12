import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"] // validasi email
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      match: [/^[0-9]{10,15}$/, "Invalid phone number format"] // validasi: hanya angka 10–15 digit
    },
    passwordHash: { 
      type: String, 
      required: true 
    },
    birthDate: { 
      type: Date 
    },
    gender: { 
      type: String, 
      enum: ["Male", "Female", "Other"] 
    },  
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// 🧠 Method untuk membandingkan password saat login
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.passwordHash);
};

const User = mongoose.model("User", userSchema);
export default User;