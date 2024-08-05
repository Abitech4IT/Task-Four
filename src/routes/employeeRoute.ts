import express from "express";
import {
  createEmployee,
  deleteEmployee,
  getAllEmployees,
  getEmployee,
  updateEmployee,
  uploadImage,
} from "../controllers/employeeController";

const router = express.Router();

router.route("/").get(getAllEmployees).post(uploadImage, createEmployee);

router
  .route("/:id")
  .get(getEmployee)
  .patch(updateEmployee)
  .delete(deleteEmployee);

export default router;
