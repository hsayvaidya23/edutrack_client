import { useState } from 'react';
import { Layout } from '@/components/shared/Layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ClassAnalytics from '@/components/shared/ClassAnalytics';
import FinancialAnalytics from '@/components/shared/FinancialAnalytics';

const Analytics = () => {
    const [analyticsType, setAnalyticsType] = useState<'financial' | 'class'>('financial');

    return (
        <Layout>
            <div className="space-y-4 p-4 max-w-[1920px] mx-auto">
                <h1 className="text-xl md:text-2xl font-bold">Analytics</h1>

                {/* Main option to choose between Financial and Class Analytics */}
                <Select value={analyticsType} onValueChange={(value: 'financial' | 'class') => setAnalyticsType(value)}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Select analytics type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="financial">Financial Analytics</SelectItem>
                        <SelectItem value="class">Class Analytics</SelectItem>
                    </SelectContent>
                </Select>

                {/* Conditional rendering based on selected analytics type */}
                {analyticsType === 'financial' ? (
                    <FinancialAnalytics />
                ) : (
                    <div>
                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle className="text-lg md:text-xl">Class Analytics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ClassAnalytics />
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Analytics;