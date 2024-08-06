import express from "express";
import multer from "multer";
import crypto from "crypto";
import sharp from "sharp";

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { Employee } from "../model/employeeModel";
import { EmployeeReqBody } from "types";
import { getOrSetCache } from "../util/redisCache";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
export const uploadImage = upload.single("image");

// export const getAllEmployees = async (
//   req: express.Request,
//   res: express.Response
// ) => {
//   try {
//     const employees = await Employee.find();

//     if (!employees) {
//       return res.status(404).json({
//         success: false,
//         message: "employees not found",
//       });
//     }

//     for (const employee of employees) {
//       employee.imageUrl =
//         "https://d28ybdxz53ziu.cloudfront.net/" + employee.image;
//       // employee.imageUrl = (process.env.IMAGE_CDN as string) + employee.image;
//     }

//     return res.status(200).json({
//       success: true,
//       message: "employees fetch successfully",
//       data: employees,
//     });
//   } catch (error: any) {
//     res.status(400).json({ error: error.message });
//   }
// };

export const getAllEmployees = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const employees = await Employee.find();

    if (!employees || employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No employees found",
      });
    }

    const s3 = new S3Client({
      credentials: {
        accessKeyId: process.env.ACCESS_KEY!,
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
      },
      region: process.env.BUCKET_REGION!,
    });

    const updatedEmployees = await Promise.all(
      employees.map(async (employee) => {
        if (!employee.image) {
          return employee;
        }

        const cacheKey = `image_url:${employee.image}`;

        employee.imageUrl = await getOrSetCache(
          cacheKey,
          async () => {
            const command = new GetObjectCommand({
              Bucket: process.env.BUCKET_NAME!,
              Key: process.env.IMAGE_CDN! + employee.image,
            });
            return getSignedUrl(s3, command, { expiresIn: 3600 });
          },
          3600 // Cache for 1 hour
        );

        return employee;
      })
    );

    return res.status(200).json({
      success: true,
      message: "Employees fetched successfully",
      data: updatedEmployees,
    });
  } catch (error: any) {
    console.error("Error in getAllEmployees:", error);
    res.status(500).json({ success: false, error: error.message });
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

    return res.status(200).json({
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
  const randomImageName = (bytes = 32) =>
    crypto.randomBytes(bytes).toString("hex");

  const bucketName: string = process.env.BUCKET_NAME ?? "";
  const bucketRegion: string = process.env.BUCKET_REGION ?? "";
  const accessKey: string = process.env.ACCESS_KEY ?? "";
  const secretKey: string = process.env.SECRET_ACCESS_KEY ?? "";

  // Check if all required variables are defined
  if (!bucketName || !bucketRegion || !accessKey || !secretKey) {
    throw new Error(
      "Missing required environment variables for S3 configuration"
    );
  }

  const s3 = new S3Client({
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
    region: bucketRegion,
  });

  try {
    // Check if the employee exists before creating
    const { email } = req.body;

    const isExist = await Employee.findOne({ email });

    if (isExist) {
      return res.status(400).json({
        success: false,
        message: "employee already exist",
      });
    }

    const image = randomImageName();

    //resize image
    const buffer = await sharp(req.file?.buffer)
      .resize({ height: 1920, width: 1080, fit: "contain" })
      .toBuffer();

    const paramsOptions = {
      Bucket: bucketName,
      Key: image,
      Body: buffer,
      ContentType: req.file?.mimetype,
    };

    const command = new PutObjectCommand(paramsOptions);
    await s3.send(command);

    const newEmployee = await Employee.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      address: req.body.address,
      gender: req.body.gender,
      mobile: req.body.mobile,
      image: image,
    });

    return res.status(201).json({
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

    return res.status(200).json({
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

    return res.status(204).json({
      success: true,
      message: "Employee deleted successfully!",
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
