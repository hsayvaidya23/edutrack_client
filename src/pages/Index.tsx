import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/shared/Layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/components/AuthProvider';
import { getStudents } from '@/api/student';
import { getTeachers } from '@/api/teacher';
import { getClasses } from '@/api/class';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Award, Users, BookOpen } from 'lucide-react';

const Index = () => {
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [totalTeachers, setTotalTeachers] = useState<number>(0);
  const [totalClasses, setTotalClasses] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0); // State for total fees paid
  const [totalFeesRemaining, setTotalFeesRemaining] = useState<number>(0); // State for total fees remaining
  const [totalSalaryPaid, setTotalSalaryPaid] = useState<number>(0); // State for total salary paid
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { authToken, currentUser } = useAuth();

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

        // Fetch classes
        const classes = await getClasses(authToken);
        setTotalClasses(classes.length);

        // Create a map of class names to their studentFees
        const classFeesMap: { [key: string]: number } = {};
        classes.forEach((cls: any) => {
          classFeesMap[cls.className] = Number(cls.studentFees) || 0;
        });

        // Log the class fees map for debugging
        console.log('Class Fees Map:', classFeesMap);

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

        // Fetch teachers
        const teachers = await getTeachers(authToken);
        setTotalTeachers(teachers.length);

        // Calculate total salary paid to teachers
        const totalSalary = teachers.reduce((sum: number, teacher: any) => {
          const salary = Number(teacher.salary) || 0; // Ensure salary is a valid number
          return sum + salary;
        }, 0);
        setTotalSalaryPaid(totalSalary);

        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        console.error('Error fetching data:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, [authToken]);

  // Data for the pie chart
  const pieChartData = [
    { name: 'Total Fees Paid', value: totalRevenue },
    { name: 'Total Salary Paid', value: totalSalaryPaid },
  ];

  // Colors for the pie chart slices
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  // Upcoming Events Data
  const upcomingEvents = [
    {
      title: 'Annual Sports Day',
      date: 'March 15, 2024',
      description: 'Join us for our annual sports day celebration featuring track events, team sports, and special performances.',
      icon: <Users className="h-6 w-6" />
    },
    {
      title: 'Parent-Teacher Meeting',
      date: 'March 20, 2024',
      description: 'Quarterly parent-teacher meeting scheduled to discuss student progress and upcoming curriculum changes.',
      icon: <Calendar className="h-6 w-6" />
    },
    {
      title: 'Science Fair',
      date: 'April 5, 2024',
      description: 'Students will showcase their innovative science projects. Open to all parents and community members.',
      icon: <BookOpen className="h-6 w-6" />
    }
  ];

  // Recent Updates Data
  const recentUpdates = [
    {
      title: 'New Computer Lab',
      description: 'State-of-the-art computer lab with 30 new workstations now open for students.'
    },
    {
      title: 'Academic Achievement',
      description: 'Our students secured top positions in the Regional Science Olympiad.'
    },
    {
      title: 'Community Service',
      description: 'Students completed 1000+ hours of community service this semester.'
    }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTeachers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClasses}</div>
            </CardContent>
          </Card>

          {/* Conditionally render Total Fees Paid for admin */}
          {currentUser?.role === 'admin' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Fees Paid</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalRevenue}</div>
              </CardContent>
            </Card>
          )}

          {/* Conditionally render Total Salary Paid for admin */}
          {currentUser?.role === 'admin' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Salary Paid</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalSalaryPaid}</div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Upcoming Events & Recent Updates */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Upcoming Events & Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {event.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm text-gray-500">{event.date}</p>
                      <p className="mt-1 text-sm">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Updates */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Recent Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUpdates.map((update, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold">{update.title}</h3>
                    <p className="mt-1 text-sm">{update.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* School Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle>School Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Academic Excellence
                  </h3>
                  <p className="mt-2 text-sm">Our school maintains a consistent 92% pass rate across all grades, with 45% of students achieving honors in their respective classes.</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold">Extra-Curricular Activities</h3>
                  <p className="mt-2 text-sm">Students participate in over 20 different clubs and activities, fostering leadership and creativity outside the classroom.</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold">Community Engagement</h3>
                  <p className="mt-2 text-sm">Regular community service programs and local partnerships help students develop social responsibility and civic awareness.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conditionally render Financial Overview for admin */}
        {currentUser?.role === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Index;