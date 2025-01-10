import { useState, useEffect } from 'react';
import { Layout } from '@/components/shared/Layout';
import { z } from 'zod';
import { DataTable, Column } from '@/components/shared/DataTable';
import { DynamicForm } from '@/components/shared/DynamicForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { getStudents, createStudent, updateStudent, deleteStudent } from '@/api/student'; // Add update and delete functions
import { useAuth } from '@/components/AuthProvider';
import { Student } from '@/types/student';
import { useNavigate } from 'react-router-dom';
import { getClasses } from '@/api/class';

// Define the student schema for validation
const studentSchema = z.object({
    name: z.string().min(1, "Name is required"),
    gender: z.string().min(1, "Gender is required"),
    dob: z.string().min(1, "Date of birth is required"),
    contactDetails: z.string().min(1, "Contact details are required"),
    feesPaid: z.string().transform((val) => Number(val)),
    className: z.string().min(1, "Class is required")
});

type StudentFormData = z.infer<typeof studentSchema>;

const columns: Column[] = [
    { key: 'name', label: 'Name' },
    { key: 'gender', label: 'Gender' },
    { key: 'dob', label: 'Date of Birth' },
    { key: 'contactDetails', label: 'Contact Details' },
    { key: 'feesPaid', label: 'Fees Paid' },
    { key: 'class', label: 'Class' }
];

const Students = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [classes, setClasses] = useState<{ value: string; label: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null); // State for selected student
    const { authToken, currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            if (!authToken) {
                setError('Authentication required');
                setLoading(false);
                return;
            }

            try {
                // Fetch students
                const studentData = await getStudents(authToken);
                setStudents(studentData);

                // Fetch classes
                const classData = await getClasses(authToken);
                setClasses(classData);

                setError(null);
            } catch (err) {
                setError('Failed to fetch data. Please try again later.');
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [authToken]);

    const handleSubmit = async (formData: StudentFormData) => {
        if (!authToken) {
            setError('Authentication required');
            return;
        }

        try {
            const studentData: Omit<Student, '_id'> = {
                name: formData.name,
                gender: formData.gender,
                dob: new Date(formData.dob).toISOString(), // Ensure proper date format
                contactDetails: formData.contactDetails,
                feesPaid: Number(formData.feesPaid),
                class: formData.className
            };

            const newStudent = await createStudent(studentData, authToken);
            setStudents(prevStudents => [...prevStudents, newStudent]);
            setIsDialogOpen(false);
            setError(null);
        } catch (err: any) {
            if (err.response) {
                console.error('Backend error:', err.response.data);
                setError(`Failed to add student: ${err.response.data.message || 'Unknown error'}`);
            } else {
                setError('Failed to add student. Please try again.');
            }
            console.error('Error adding student:', err);
        }
    };

    const handleUpdateStudent = async (formData: StudentFormData) => {
        if (!authToken || !selectedStudent || !selectedStudent._id) {
            setError('Authentication required or no student selected');
            return;
        }

        try {
            const updatedStudentData: Student = {
                ...selectedStudent,
                name: formData.name, // Ensure proper date format
                contactDetails: formData.contactDetails,
                feesPaid: Number(formData.feesPaid),
            };

            const updatedStudent = await updateStudent(selectedStudent._id, updatedStudentData, authToken);
            setStudents(prevStudents =>
                prevStudents.map(student =>
                    student._id === updatedStudent._id ? updatedStudent : student
                )
            );

            setIsDialogOpen(false);
            setSelectedStudent(null);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to update student. Please try again.');
            console.error('Error updating student:', err);
        }
    };

    const handleDeleteStudent = async () => {
        if (!authToken || !selectedStudent || !selectedStudent._id) {
            setError('Authentication required or no student selected');
            return;
        }

        try {
            await deleteStudent(selectedStudent._id, authToken);
            setStudents(prevStudents =>
                prevStudents.filter(student => student._id !== selectedStudent._id)
            );

            setIsDialogOpen(false);
            setSelectedStudent(null);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to delete student. Please try again.');
            console.error('Error deleting student:', err);
        }
    };

    const handleRowClick = (student: Student) => {
        if (!student._id) {
            console.error('Student ID is missing:', student);
            setError('Student ID is missing. Please try again.');
            return;
        }
        setSelectedStudent(student);
        setIsDialogOpen(true);
    };

    const formFields = [
        {
            name: 'name',
            label: 'Name',
            type: 'text' as const,
            validation: studentSchema.shape.name
        },
        ...(!selectedStudent ? [ // Only include gender, dob, and class in "Add Student" mode
            {
                name: 'gender',
                label: 'Gender',
                type: 'select' as const,
                options: [
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Other', label: 'Other' },
                ],
                validation: studentSchema.shape.gender
            },
            {
                name: 'dob',
                label: 'Date of Birth',
                type: 'date' as const,
                validation: studentSchema.shape.dob
            },
            {
                name: 'className',
                label: 'Class',
                type: 'select' as const,
                options: classes,
                validation: studentSchema.shape.className
            },
        ] : []),
        {
            name: 'contactDetails',
            label: 'Contact Details',
            type: 'text' as const,
            validation: studentSchema.shape.contactDetails
        },
        {
            name: 'feesPaid',
            label: 'Fees Paid',
            type: 'number' as const,
            validation: studentSchema.shape.feesPaid
        },
    ];
    return (
        <Layout>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Student Management</h1>
                    {(currentUser?.role === 'student' || currentUser?.role === 'admin') && (
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>Add New Student</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>
                                        {selectedStudent ? 'Edit Student' : 'Add New Student'}
                                    </DialogTitle>
                                </DialogHeader>
                                <DynamicForm
                                    fields={formFields}
                                    onSubmit={selectedStudent ? handleUpdateStudent : handleSubmit}
                                    defaultValues={selectedStudent || undefined}
                                    onDelete={selectedStudent ? handleDeleteStudent : undefined} // Pass onDelete prop
                                />
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                {loading && (
                    <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {!loading && !error && (
                    <DataTable
                        columns={columns}
                        data={students}
                        onRowClick={currentUser?.role === 'admin' ? handleRowClick : undefined} // Conditional onRowClick
                    />
                )}
            </div>
        </Layout>
    );
};

export default Students;