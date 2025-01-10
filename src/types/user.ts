export interface User {
    id: string;
    email: string;
    role: 'admin' | 'teacher' | 'student';
    password: string;
    name?: string;
    gender?: string;
    dob?: Date;
    contactDetails?: string;
    salary?: number; // For teachers
    feesPaid?: number; // For students
    assignedClass?: string; // For teachers and students
}

export interface AuthResponse {
    token: string;
    user: User;
}