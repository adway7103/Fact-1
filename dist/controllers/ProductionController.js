var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ProductionModel } from "../models/Production.js";
import Inventory from "../models/Inventory.js"; // Import your Inventory model
import mongoose from "mongoose";
// @ts-ignore
import pdf from "html-pdf-node"; // Import html-pdf-node
// Function to create a new production and delete the roll from inventory
export const startNewProduction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { rolls, name, contact, expectedDeliveryDate, assignTo, markAsDone, type, image, } = req.body;
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
    }
    else {
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
    if (!type) {
        return res.status(400).json({
            success: false,
            message: "The type is required.",
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
            type,
            image,
        });
        const savedProduction = yield newProduction.save();
        //deleting roll based on rollNum after starting production.
        for (const roll of rolls) {
            const inventoryRoll = yield Inventory.findOneAndDelete({
                "extra_fields.0.roll_number": roll.rollNo,
            });
            if (!inventoryRoll) {
                return res.status(404).json({
                    success: false,
                    message: `Roll with rollNo ${roll.rollNo} not found in Inventory.`,
                });
            }
        }
        res.locals.createdDocument = savedProduction;
        return res.status(201).json({
            success: true,
            message: "Production created successfully and roll(s) deleted from inventory.",
            production: savedProduction,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message,
        });
    }
});
//function to fetch production
export const fetchProductions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productions = yield ProductionModel.find().populate({
            path: "assignTo", // Field in Production schema
            select: "name phoneNo", // Only select the 'name' and 'phoneNo' field from the User schema
        });
        return res.status(200).json({
            success: true,
            message: "Production fetched successfully.",
            productions,
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
//function to fetch production by id
export const fetchProductionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const production = yield ProductionModel.findById(id);
        return res.status(200).json({
            success: true,
            message: "Production fetched successfully.",
            production,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
});
//function to fetch production for assigned user
export const getUserAssignedProduction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id } = req.body;
        const productions = yield ProductionModel.find({
            assignTo: user_id,
            // markAsDone: false,
        }).populate({
            path: "assignTo",
            select: "name phoneNo",
        });
        return res.status(200).json({
            success: true,
            message: "My Production fetched successfully.",
            productions,
        });
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});
//function to update production
export const updateProductionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { markAsDone, rolls } = req.body;
    try {
        const production = yield ProductionModel.findById(id);
        if (!production) {
            return res.status(404).json({
                success: false,
                message: "Production not found.",
            });
        }
        // Update markAsDone if provided
        if (typeof markAsDone !== "undefined") {
            production.markAsDone = markAsDone;
        }
        // Update noOfPieces for each roll in rollsToUpdate
        if (Array.isArray(rolls)) {
            rolls.forEach(({ rollNo, noOfPieces }) => {
                const rollToUpdate = production.rolls.find((roll) => roll.rollNo === rollNo);
                if (rollToUpdate) {
                    rollToUpdate.noOfPieces = noOfPieces;
                }
            });
        }
        const updatedProduction = yield production.save();
        res.locals.createdDocument = updatedProduction;
        return res.status(200).json({
            success: true,
            message: "Production updated successfully.",
            production: updatedProduction,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message,
        });
    }
});
//generate production challan
export const generatePdf = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        // Fetch data from the database using the provided ID
        const productionDocument = yield ProductionModel.findById(id).populate({
            path: "assignTo",
            select: "name phoneNo",
        });
        const production = productionDocument === null || productionDocument === void 0 ? void 0 : productionDocument.toObject();
        if (!production) {
            return res.status(404).json({ message: "Production not found" });
        }
        function formatDate(date) {
            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        }
        // HTML content for the PDF
        const rollTables = production.rolls
            .map((roll) => `
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
    </table>
    <br/>
  `)
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
            width: 50%; 
          }
          th { 
            background-color: #f2f2f2; 
            text-align: left; 
          }
       img { 
          width: 200px; 
          height: 150px; 
          object-fit: cover;
        }
        </style>
      </head>
      <body>
        <h1>Production Details</h1>
        ${rollTables} 
        <h2>Assign To</h2>
        <p>Name: ${(_a = production === null || production === void 0 ? void 0 : production.assignTo) === null || _a === void 0 ? void 0 : _a.name}</p>
        <p>Phone Number: ${(_b = production === null || production === void 0 ? void 0 : production.assignTo) === null || _b === void 0 ? void 0 : _b.phoneNo}</p>
        <h2>Other Details</h2>
        <p>Start Date: ${formatDate(production.createdAt)}</p>
        <p>Expected Delivery Date: ${production.expectedDeliveryDate}</p>
        <p>Delivery Date: ${production.markAsDone === true
            ? formatDate(production.updatedAt)
            : "-"}</p>
         <img src="${production.image}" alt="Production Image" />
      </body>
    </html>
  `;
        // Convert HTML content to PDF
        const file = { content: htmlContent }; // html-pdf-node accepts object with HTML content
        const options = { format: "A4" }; // You can set options like paper size, margins, etc.
        // Generate PDF
        pdf.generatePdf(file, options).then((pdfBuffer) => {
            // Set headers for PDF download
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", "attachment; filename=order-details.pdf");
            // Send the PDF buffer as response
            res.end(pdfBuffer);
        });
    }
    catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).json({ message: "Error generating PDF" });
    }
});
