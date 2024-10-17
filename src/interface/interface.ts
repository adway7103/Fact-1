import { ObjectId } from "mongoose";

interface Roll {
  costPrice: number;
  noOfPieces: number;
  grade: string;
  meter: number;
  price: number;
  rollNo: string;
  sort: string;
  _id: ObjectId;
}

export interface IProduction {
  rolls: Roll[];
  expectedDeliveryDate: string;
  assignTo: {
    _id: ObjectId;
    name: string;
    phoneNo: string;
  };
  markAsDone: boolean;
  createdAt: Date;
  updatedAt: Date;
}
