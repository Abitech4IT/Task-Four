import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  firstName: {
    type: String,
    require: [true, "please enter your firstName"],
  },
  lastName: {
    type: String,
    require: [true, "please enter your lastName"],
  },
  email: {
    type: String,
    require: [true, "please provide your email"],
    unique: true,
  },
  address: {
    type: String,
    require: [true, "please enter your address"],
  },
  gender: {
    type: String,
    enum: ["male", "female"],
    require: [true, "please enter your gender"],
  },
  mobile: {
    type: String,
    require: true,
  },
  image: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

export const Employee = mongoose.model("Employee", employeeSchema);
