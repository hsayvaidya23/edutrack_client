export interface Class {
    id: string;
    className: string;
    year: number;
    teacher: string; // Teacher ID
    studentFees: number;
    maxStudents: number;
    students: string[]; // Array of Student IDs
}