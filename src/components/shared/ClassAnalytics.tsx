import React, { useState, useEffect } from 'react';
import { getStudents } from '@/api/student';
import { getTeachers } from '@/api/teacher';
import { getClasses } from '@/api/class';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Award, Users, BookOpen } from 'lucide-react';
import { useAuth } from '../AuthProvider'; // Assuming you have an AuthContext for authentication

const ClassAnalytics = () => {
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [totalTeachers, setTotalTeachers] = useState<number>(0);
  const [totalClasses, setTotalClasses] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0); // State for total fees paid
  const [totalFeesRemaining, setTotalFeesRemaining] = useState<number>(0); // State for total fees remaining
  const [totalSalaryPaid, setTotalSalaryPaid] = useState<number>(0); // State for total salary paid
  const [genderDistribution, setGenderDistribution] = useState<{ name: string; value: number }[]>([]); // State for gender distribution
  const [classDetails, setClassDetails] = useState<{ className: string; studentCount: number; teacherName: string }[]>([]); // State for class details
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { authToken } = useAuth(); // Assuming useAuth provides authToken

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!authToken) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      try {
        // Fetch students
        const students = await getStudents(authToken);
        setTotalStudents(students.length);

        // Calculate gender distribution
        const genderCounts = students.reduce(
          (acc: { male: number; female: number; other: number }, student: any) => {
            if (student.gender === 'Male') acc.male++;
            else if (student.gender === 'Female') acc.female++;
            else acc.other++;
            return acc;
          },
          { male: 0, female: 0, other: 0 }
        );

        // Set gender distribution data for the pie chart
        setGenderDistribution([
          { name: 'Male', value: genderCounts.male },
          { name: 'Female', value: genderCounts.female },
          { name: 'Other', value: genderCounts.other },
        ]);

        // Fetch classes
        const classes = await getClasses(authToken);
        setTotalClasses(classes.length);

        // Fetch teachers
        const teachers = await getTeachers(authToken);
        setTotalTeachers(teachers.length);

        // Create a map of class names to their studentFees
        const classFeesMap: { [key: string]: number } = {};
        classes.forEach((cls: any) => {
          classFeesMap[cls.className] = Number(cls.studentFees) || 0;
        });

        // Calculate total fees paid and total expected fees
        let totalFeesPaid = 0;
        let totalExpectedFees = 0;

        students.forEach((student: any) => {
          const feesPaid = Number(student.feesPaid) || 0;
          totalFeesPaid += feesPaid;

          // Find the student's class and add its studentFees to totalExpectedFees
          const studentClass = student.class;
          if (classFeesMap[studentClass]) {
            totalExpectedFees += classFeesMap[studentClass];
          } else {
            console.warn(`Class not found for student: ${student.name}, Class: ${studentClass}`);
          }
        });

        setTotalRevenue(totalFeesPaid);

        // Calculate total fees remaining
        const feesRemaining = totalExpectedFees - totalFeesPaid;
        setTotalFeesRemaining(feesRemaining);

        // Calculate total salary paid to teachers
        const totalSalary = teachers.reduce((sum: number, teacher: any) => {
          const salary = Number(teacher.salary) || 0; // Ensure salary is a valid number
          return sum + salary;
        }, 0);
        setTotalSalaryPaid(totalSalary);

        // Prepare class details (students in each class and assigned teacher)
        const classDetailsData = classes.map((cls: any) => {
          const studentsInClass = students.filter((student: any) => student.class === cls.className);
          const assignedTeacher = teachers.find((teacher: any) => teacher.assignedClass === cls.className);
          return {
            className: cls.className,
            studentCount: studentsInClass.length,
            teacherName: assignedTeacher ? assignedTeacher.name : 'Not Assigned',
          };
        });

        setClassDetails(classDetailsData);

        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        console.error('Error fetching data:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, [authToken]);

  // Colors for the pie chart
  const COLORS = ['#0088FE', '#FF8042', '#00C49F'];

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Class Analytics</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <Users className="text-blue-500 mr-4" size={32} />
          <div>
            <p className="text-gray-600">Total Students</p>
            <p className="text-2xl font-bold">{totalStudents}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <BookOpen className="text-green-500 mr-4" size={32} />
          <div>
            <p className="text-gray-600">Total Classes</p>
            <p className="text-2xl font-bold">{totalClasses}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <Award className="text-purple-500 mr-4" size={32} />
          <div>
            <p className="text-gray-600">Total Teachers</p>
            <p className="text-2xl font-bold">{totalTeachers}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <Calendar className="text-yellow-500 mr-4" size={32} />
          <div>
            <p className="text-gray-600">Total Salary Paid</p>
            <p className="text-2xl font-bold">${totalSalaryPaid}</p>
          </div>
        </div>
      </div>

      {/* Gender Distribution Pie Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Student Gender Distribution</h2>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={genderDistribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(2)}%`}
            >
              {genderDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Class Details Table */}
      {/* <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Class Details</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3">Class Name</th>
              <th className="p-3">Number of Students</th>
              <th className="p-3">Assigned Teacher</th>
            </tr>
          </thead>
          <tbody>
            {classDetails.map((cls, index) => (
              <tr key={index} className="border-b">
                <td className="p-3">{cls.className}</td>
                <td className="p-3">{cls.studentCount}</td>
                <td className="p-3">{cls.teacherName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> */}
    </div>
  );
};

export default ClassAnalytics;

