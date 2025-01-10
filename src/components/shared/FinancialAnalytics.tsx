import { useState, useEffect } from 'react';
import { getTeachers } from '@/api/teacher';
import { getClasses } from '@/api/class';
import { getStudents } from '@/api/student';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useAuth } from '@/components/AuthProvider';

interface FinancialData {
  totalSalaries: number;
  totalExpectedFees: number;
  totalFeesPaid: number;
  feesRemaining: number;
}

const FinancialAnalytics = () => {
  const [financialData, setFinancialData] = useState<FinancialData>({
    totalSalaries: 0,
    totalExpectedFees: 0,
    totalFeesPaid: 0,
    feesRemaining: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { authToken } = useAuth();

  useEffect(() => {
    const fetchFinancialData = async () => {
      if (!authToken) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      try {
        const [teachers, classes, students] = await Promise.all([
          getTeachers(authToken),
          getClasses(authToken),
          getStudents(authToken),
        ]);

        // Calculate total teacher salaries
        const totalSalaries = teachers.reduce((sum, teacher) => sum + (Number(teacher.salary) || 0), 0);

        // Create a map of class fees
        const classFeesMap = classes.reduce((map, cls) => ({
          ...map,
          [cls.className]: Number(cls.studentFees) || 0,
        }), {} as Record<string, number>);

        // Calculate student fees
        let totalFeesPaid = 0;
        let totalExpectedFees = 0;

        students.forEach((student) => {
          totalFeesPaid += Number(student.feesPaid) || 0;

          const classFee = classFeesMap[student.class];
          if (classFee) {
            totalExpectedFees += classFee;
          }
        });

        setFinancialData({
          totalSalaries,
          totalExpectedFees,
          totalFeesPaid,
          feesRemaining: totalExpectedFees - totalFeesPaid,
        });
        setError(null);
      } catch (err) {
        setError('Failed to fetch financial data. Please try again later.');
        console.error('Error fetching financial data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, [authToken]);

  // Prepare data for the charts
  const barChartData = [
    // { category: 'Expected Fees', amount: financialData.totalExpectedFees },
    { category: 'Fees Collected', amount: financialData.totalFeesPaid },
    { category: 'Teacher Salaries', amount: financialData.totalSalaries },
  ];

  const pieChartData = [
    { name: 'Fees Collected', value: financialData.totalFeesPaid },
    // { name: 'Fees Remaining', value: financialData.feesRemaining },
    { name: 'Teacher Salaries', value: financialData.totalSalaries },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Financial Analytics</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <div>
            <p className="text-gray-600">Total Expected Fees</p>
            <p className="text-2xl font-bold">${financialData.totalExpectedFees.toLocaleString()}</p>
          </div>
        </div> */}

        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <div>
            <p className="text-gray-600">Total Fees Collected</p>
            <p className="text-2xl font-bold">${financialData.totalFeesPaid.toLocaleString()}</p>
          </div>
        </div>

        {/* <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <div>
            <p className="text-gray-600">Total Fees Remaining</p>
            <p className="text-2xl font-bold">${financialData.feesRemaining.toLocaleString()}</p>
          </div>
        </div> */}

        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <div>
            <p className="text-gray-600">Total Salary Paid</p>
            <p className="text-2xl font-bold">${financialData.totalSalaries.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Financial Distribution Bar Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Financial Distribution</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={barChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="amount" fill="#0088FE" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Financial Overview Pie Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Financial Overview</h2>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={pieChartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(2)}%`}
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
    </div>
  );
};

export default FinancialAnalytics;