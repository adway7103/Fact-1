import { Request, Response } from "express";
import { ProductionModel } from "../models/Production.js";
import Inventory from "../models/Inventory.js"; // Import your Inventory model
import mongoose from "mongoose";
import puppeteer from "puppeteer";
import { IProduction } from "../interface/interface.js";

// Function to create a new production and delete the roll from inventory
export const startNewProduction = async (req: Request, res: Response) => {
  let { rolls, name, contact, expectedDeliveryDate, assignTo, markAsDone } =
    req.body;

  if (!rolls || !Array.isArray(rolls) || rolls.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please Add Roll to continue.",
    });
  }

  if (assignTo === "others") {
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "The 'name' field is required.",
      });
    }

    if (!contact) {
      return res.status(400).json({
        success: false,
        message: "The 'contact' field is required.",
      });
    }

    assignTo = null;
  } else {
    if (!mongoose.Types.ObjectId.isValid(assignTo)) {
      return res.status(400).json({
        success: false,
        message: "The Assign To field is required.",
      });
    }
  }

  if (!expectedDeliveryDate) {
    return res.status(400).json({
      success: false,
      message: "The Expected Delivery Date is required.",
    });
  }

  try {
    // Create the new production
    const newProduction = new ProductionModel({
      rolls,
      name: assignTo === null ? name : undefined,
      contact: assignTo === null ? contact : undefined,
      expectedDeliveryDate,
      assignTo,
      markAsDone: markAsDone || false,
    });

    const savedProduction = await newProduction.save();

    //deleting roll based on rollNum after starting production.
    for (const roll of rolls) {
      const inventoryRoll = await Inventory.findOneAndDelete({
        "extra_fields.0.roll_number": roll.rollNo,
      });

      if (!inventoryRoll) {
        return res.status(404).json({
          success: false,
          message: `Roll with rollNo ${roll.rollNo} not found in Inventory.`,
        });
      }
    }

    return res.status(201).json({
      success: true,
      message:
        "Production created successfully and roll(s) deleted from inventory.",
      production: savedProduction,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

//function to fetch production
export const fetchProductions = async (req: Request, res: Response) => {
  try {
    const productions = await ProductionModel.find().populate({
      path: "assignTo", // Field in Production schema
      select: "name phoneNo", // Only select the 'name' and 'phoneNo' field from the User schema
    });

    return res.status(200).json({
      success: true,
      message: "Production fetched successfully.",
      productions,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

//function to fetch production for assigned user
export const getUserAssignedProduction = async (
  req: Request,
  res: Response
) => {
  try {
    const { user_id } = req.body;
    const productions = await ProductionModel.find({
      assignTo: user_id,
      markAsDone: false,
    });
    return res.status(200).json({
      success: true,
      message: "My Production fetched successfully.",
      productions,
    });
  } catch (error: any) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

//function to update production
export const updateProductionById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { markAsDone } = req.body;

  try {
    const production = await ProductionModel.findById(id);

    if (!production) {
      return res.status(404).json({
        success: false,
        message: "Production not found.",
      });
    }
    production.markAsDone = markAsDone;
    const updatedProduction = await production.save();

    return res.status(200).json({
      success: true,
      message: "Production updated successfully.",
      production: updatedProduction,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

//generate production challan
export const generatePdf = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Fetch data from the database using the provided ID
    const productionDocument = await ProductionModel.findById(id).populate({
      path: "assignTo",
      select: "name phoneNo",
    });

    const production = productionDocument?.toObject() as IProduction;

    if (!production) {
      return res.status(404).json({ message: "Production not found" });
    }

    function formatDate(date: Date): string {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    }

    // HTML content for the PDF
    const rollTables = production.rolls
      .map(
        (roll: any) => `
    <h2>Roll Number: ${roll.rollNo}</h2>
    <table>
      <tr>
        <th>C/P</th>
        <td>${roll.costPrice}</td>
      </tr>
      <tr>
        <th>No of Pieces</th>
        <td>${roll.noOfPieces}</td>
      </tr>
      <tr>
        <th>Grade</th>
        <td>${roll.grade}</td>
      </tr>
      <tr>
        <th>Sort</th>
        <td>${roll.sort}</td>
      </tr>
      <tr>
        <th>Meter</th>
        <td>${roll.meter}</td>
      </tr>
      <tr>
        <th>Price</th>
        <td>${roll.price}</td>
      </tr>
    </table>
    <br/> <!-- Add space between tables -->
  `
      )
      .join("");

    // HTML content for the PDF
    const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { text-align: center; }
          h2 { margin-top: 20px; }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px; 
          }
          th, td { 
            border: 1px solid #dddddd; 
            text-align: center; 
            padding: 8px; 
            width: 50%; /* Adjust width if needed */
          }
          th { 
            background-color: #f2f2f2; 
            text-align: left; 
          }
        </style>
      </head>
      <body>
        <h1>Production Details</h1>
        ${rollTables} <!-- Insert generated roll tables here -->
        <h2>Assign To</h2>
        <p>Name: ${production?.assignTo?.name}</p>
        <p>Phone Number: ${production?.assignTo?.phoneNo}</p>
        <h2>Other Details</h2>
        <p>Start Date: ${formatDate(production.createdAt)}</p>
        <p>Expected Delivery Date: ${production.expectedDeliveryDate}</p>
      </body>
    </html>
  `;
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: false,
      executablePath: puppeteer.executablePath(),
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      width: "12in", // or '300mm'
      height: "8.5in", // or '215mm'
      printBackground: true,
    });

    await browser.close();

    // Set headers to download the PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=order-details.pdf"
    );

    // Send the PDF buffer as response
    res.end(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ message: "Error generating PDF" });
  }
};
