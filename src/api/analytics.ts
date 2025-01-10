export const getTeacherSalaries = async () => {
    const response = await fetch('/api/analytics/teacher-salaries');
    return response.json();
};

export const getStudentFees = async () => {
    const response = await fetch('/api/analytics/student-fees');
    return response.json();
};