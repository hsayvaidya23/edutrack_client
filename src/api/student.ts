import axios from 'axios';
import { Student } from '../types/student';

const API_URL =`${import.meta.env.VITE_SITE}/api/students`;

// Get all students
export const getStudents = async (token: string): Promise<Student[]> => {
  const response = await axios.get<Student[]>(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Create a student
export const createStudent = async (studentData: Omit<Student, 'id'>, token: string): Promise<Student> => {
  const response = await axios.post<Student>(API_URL, studentData, {
      headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Update a student
export const updateStudent = async (id: string, studentData: Partial<Student>, token: string): Promise<Student> => {
  const response = await axios.put<Student>(`${API_URL}/${id}`, studentData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Delete a student
export const deleteStudent = async (id: string, token: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};