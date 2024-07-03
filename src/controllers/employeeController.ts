import express from "express";
import { Employee } from "../model/employeeModel";
import { EmployeeReqBody } from "types";

export const getAllEmployees = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const employees = await Employee.find();

    if (!employees) {
      return res.status(404).json({
        success: false,
        message: "employees not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "employees fetch successfully",
      data: employees,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getEmployee = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const id = req.params.id;

    const employeeData = await Employee.findById(id);

    if (!employeeData) {
      return res.status(404).json({
        success: false,
        message: "invalid employee",
      });
    }

    res.status(200).json({
      success: true,
      message: "employee retrieved successfully",
      data: employeeData,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const createEmployee = async (
  req: express.Request<{}, {}, EmployeeReqBody>,
  res: express.Response
) => {
  const { email } = req.body;

  try {
    // Check if the employee exists before creating
    const isExist = await Employee.findOne({ email });

    if (isExist) {
      return res.status(400).json({
        success: false,
        message: "employee already exist",
      });
    }

    const newEmployee = await Employee.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      address: req.body.address,
      gender: req.body.gender,
      mobile: req.body.mobile,
    });

    res.status(201).json({
      success: true,
      message: "Employee created successfully!",
      data: newEmployee,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateEmployee = async (
  req: express.Request<{ id: string }, {}, EmployeeReqBody>,
  res: express.Response
) => {
  const id = req.params.id;

  try {
    // Check if the employee exists before updating
    const isExist = await Employee.findOne({ _id: id });

    if (!isExist) {
      return res.status(404).json({
        success: false,
        message: "invalid employee",
      });
    }

    // Update the employee data
    const updatedEmployee = await Employee.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Employee updated successfully!",
      data: updatedEmployee,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteEmployee = async (
  req: express.Request<{ id: string }, {}, EmployeeReqBody>,
  res: express.Response
) => {
  const id = req.params.id;

  try {
    if (!id) {
      return res.status(404).json({
        success: false,
        message: "invalid employee",
      });
    }
    await Employee.findByIdAndDelete(id);

    res.status(204).json({
      success: true,
      message: "Employee deleted successfully!",
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
