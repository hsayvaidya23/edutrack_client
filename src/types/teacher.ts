import { Class } from './class';

export interface Teacher {
  id: string;
  name: string;
  gender: string;
  dob: string;
  contactDetails: string;
  salary: number;
  assignedClass: string | null; // Class ID
}