import { Class } from './class';

export interface Student {
  id: string;
  name: string;
  gender: string;
  dob: Date;
  contactDetails: string;
  feesPaid: number;
  class: string; // Class ID
}