var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import mongoose from "mongoose";
import Lifecycle from "../models/Lifecycle.js";
import { v4 as uuidv4 } from "uuid";
import { ProductionModel } from "../models/Production.js";
// @ts-ignore
import pdf from "html-pdf-node"; // Import html-pdf-node
// Function to create a new lifecycle
export const startNewLifecycle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uuid = uuidv4();
    const lotNumber = `LN-${uuid.slice(0, 4)}`;
    let { rolls, markAsDone, stages } = req.body;
    if (!rolls || !Array.isArray(rolls) || rolls.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Please Add Roll to continue.",
        });
    }
    for (const stage of stages) {
        const { expectedDeliveryDate, assignTo, name, contact } = stage;
        // Validate expectedDeliveryDate
        if (!expectedDeliveryDate) {
            return res.status(400).json({
                success: false,
                message: "The Expected Delivery Date is required in stages.",
            });
        }
        // Validate assignTo
        if (assignTo === "others") {
            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: "The 'name' field is required in stages when assignTo is 'others'.",
                });
            }
            if (!contact) {
                return res.status(400).json({
                    success: false,
                    message: "The 'contact' field is required in stages when assignTo is 'others'.",
                });
            }
            // Set assignTo to null if it's "others"
            stage.assignTo = null;
        }
        else {
            if (!mongoose.Types.ObjectId.isValid(assignTo)) {
                return res.status(400).json({
                    success: false,
                    message: "The Assign To field must be a valid ObjectId in stages.",
                });
            }
        }
        stage.startTime = new Date();
    }
    try {
        // Create the new lifecycle
        const newLifecycle = new Lifecycle({
            rolls,
            markAsDone: markAsDone || false,
            lotNo: lotNumber,
            stages,
        });
        const savedLifecycle = yield newLifecycle.save();
        for (const roll of rolls) {
            const production = yield ProductionModel.findOne({
                "rolls.rollNo": roll.rollNo,
            });
            if (!production) {
                return res.status(404).json({
                    success: false,
                    message: `Roll with rollNo ${roll.rollNo} not found in production.`,
                });
            }
            if (production.rolls.length > 1) {
                production.rolls = production.rolls.filter((r) => r.rollNo !== roll.rollNo);
                yield production.save();
            }
            else if (production.rolls.length === 1) {
                yield ProductionModel.findByIdAndDelete(production._id);
            }
        }
        return res.status(201).json({
            success: true,
            message: "Lifecycle started successfully.",
            lifecycle: newLifecycle,
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
//function to fetch all lifecycle
export const fetchLifecycles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lifecycle = yield Lifecycle.find().populate({
            path: "stages.assignTo",
            select: "name phoneNo",
        });
        return res.status(200).json({
            success: true,
            message: "Lifecycle fetched successfully.",
            lifecycle,
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
//function to fetch lifecycle by id
export const fetchLifecycleById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const lifecycle = yield Lifecycle.findById(id).populate({
            path: "stages.assignTo",
            select: "name phoneNo",
        });
        return res.status(200).json({
            success: true,
            message: "Lifecycle fetched successfully.",
            lifecycle,
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
//update stage
export const updateLifecycle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, stageId } = req.params;
    const { isCompleted, markAsDone } = req.body;
    try {
        const lifecycle = yield Lifecycle.findById(id);
        if (!lifecycle) {
            return res.status(404).json({
                success: false,
                message: "Lifecycle not found.",
            });
        }
        const stage = lifecycle.stages.find((stage) => {
            return stage._id.toString() === stageId;
        });
        if (!stage) {
            return res.status(404).json({
                success: false,
                message: "Stage not found in the lifecycle.",
            });
        }
        stage.isCompleted = isCompleted;
        if (isCompleted) {
            stage.endTime = new Date();
        }
        else {
            stage.endTime = undefined;
        }
        stage.isCompleted = isCompleted;
        // Update end time if completed
        if (isCompleted) {
            stage.endTime = new Date();
        }
        else {
            stage.endTime = undefined;
        }
        if (markAsDone &&
            lifecycle.stages[lifecycle.stages.length - 1]._id.toString() === stageId) {
            lifecycle.markAsDone = true;
            lifecycle.completionDate = new Date(); // Set completion date for the entire lifecycle
        }
        yield lifecycle.save();
        return res.status(200).json({
            success: true,
            message: "Stage updated successfully.",
            lifecycle,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "An error occurred while updating the stage.",
            error: error.message,
        });
    }
});
// Function to start a new stage
export const startLifecycleNewStage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    let { stage, expectedDeliveryDate, assignTo, name, contact, additionalInformation, } = req.body;
    try {
        const lifecycle = yield Lifecycle.findById(id);
        if (!lifecycle) {
            return res.status(404).json({
                success: false,
                message: "Lifecycle not found.",
            });
        }
        // Check if the stage already exists
        const existingStage = lifecycle.stages.find((s) => s.stage.toLowerCase() === stage.toLowerCase());
        if (existingStage) {
            return res.status(400).json({
                success: false,
                message: `The stage '${stage}' already created in this lifecycle.`,
            });
        }
        // Validate assignTo
        if (assignTo === "others") {
            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: "The 'name' field is required when assignTo is 'others'.",
                });
            }
            if (!contact) {
                return res.status(400).json({
                    success: false,
                    message: "The 'contact' field is required when assignTo is 'others'.",
                });
            }
            assignTo = null;
            console.log(assignTo);
        }
        else if (!mongoose.Types.ObjectId.isValid(assignTo)) {
            return res.status(400).json({
                success: false,
                message: "The Assign To field must be a valid ObjectId.",
            });
        }
        const newStage = {
            stage: stage.toLowerCase(),
            startTime: new Date(),
            expectedDeliveryDate,
            assignTo,
            name,
            contact,
            isCompleted: false,
            additionalInformation: additionalInformation ? additionalInformation : "",
        };
        const updatedLifecycle = yield Lifecycle.findByIdAndUpdate(id, { $push: { stages: newStage } }, { new: true });
        return res.status(201).json({
            success: true,
            message: "Lifecycle stage started successfully.",
            lifecycle: updatedLifecycle,
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
    try {
        const { id, stageId } = req.params;
        // Fetch data from the database using the provided ID
        const lifecycleData = yield Lifecycle.findById(id).populate({
            path: "stages.assignTo",
            select: "name phoneNo",
        });
        const lifecycle = lifecycleData === null || lifecycleData === void 0 ? void 0 : lifecycleData.toObject();
        if (!lifecycle) {
            return res.status(404).json({ message: "Lifecycle not found" });
        }
        const findStage = lifecycle.stages.find((stage) => stage._id == stageId);
        if (!findStage) {
            return res.status(404).json({ message: "Stage not found" });
        }
        // Function to format date
        function formatDate(date) {
            if (!date)
                return 'N/A';
            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        }
        // HTML content for the PDF
        const rollTables = `
      <h3>Stage: ${findStage.stage}</h2>

      <table>
        <tr>
          <th>Start Date</th>
          <td>${formatDate(findStage.startTime)}</td>
        </tr>
        <tr>
          <th>Expected Delivery Date</th>
          <td>${findStage.expectedDeliveryDate}</td>
        </tr>
        <tr>
          <th>Delivery Date</th>
          <td>${formatDate(findStage.endTime)}</td>
        </tr>
        <tr>
          <th>Assign To</th>
          <td>${findStage.assignTo ? findStage.assignTo.name : findStage.name}</td>
        </tr>
        <tr>
          <th>Phone number</th>
          <td>${findStage.assignTo ? findStage.assignTo.phoneNo : findStage.contact}</td>
        </tr>
        <tr>
          <th>Additional Information</th>
          <td>${findStage.additionalInformation ? findStage.additionalInformation : "-"}</td>
        </tr>
      </table>
      <br/>
    `;
        // HTML content for the PDF
        const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; }
            h2 { text-align: center; }
            h3 { margin-top: 20px; }
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
          </style>
        </head>
        <body>
          <h1>Lifecycle Stage Details</h1>
          <h2>Lot Number: ${lifecycle.lotNo}</h2>
          ${rollTables} 
         
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
