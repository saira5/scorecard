'use server';

import connectToDb from '@/lib/mongoose';
import Report, { ReportData } from '@/models/Report';
import { generateReportFileName, getLocalDate } from '@/utils';

export const getCurrentDateLastReportNumber = async () => {
    try {
        await connectToDb();

        const today = getLocalDate();
        const report = await Report.findOne({ createdDate: today }).sort({ reportNumber: -1 });

        if (report) {
            return { reportNumber: report.reportNumber };
        } else {
            return { reportNumber: 0 };
        }
    } catch (error) {
        console.error('Error fetching last report number:', error);
        return { error: 'Internal server error' };
    }
};

export const uploadReport = async (fileBufferString: string, dateRangeString: string, startDate: string, endDate: string) => {
    try {
        await connectToDb();

        const reportNumberResponse = await getCurrentDateLastReportNumber();

        if (reportNumberResponse.error) {
            return { error: reportNumberResponse.error };
        }

        const reportNumber = reportNumberResponse.reportNumber + 1;
        const createdDate = getLocalDate();

        const filename = generateReportFileName(reportNumber, startDate, endDate);

        const contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

        const report = new Report({
            filename,
            fileBufferString,
            contentType,
            createdDate,
            reportNumber,
            dateRangeString,
        });

        await report.save();

        return { success: true };
    } catch (error) {
        console.error('Error uploading report:', error);
        return { error: 'Internal server error' };
    }
};

export const getReports = async () => {
    try {
        await connectToDb();

        const reportDocuments = await Report.find().sort({ createdAt: -1 }).lean();

        const reports = reportDocuments.map(({ _id, ...report }) => ({
            id: _id?.toString() || '',
            ...report,
        })) as ReportData[];

        return { reports };
    } catch (error) {
        console.error('Error fetching reports:', error);
        return { error: 'Internal server error' };
    }
};

export const deleteReport = async (reportId: string) => {
    try {
        await connectToDb();

        const result = await Report.deleteOne({ _id: reportId });

        if (result.deletedCount === 0) {
            return { error: 'Report not found' };
        }

        return { success: true };
    } catch (error) {
        console.error('Error deleting report:', error);
        return { error: 'Internal server error' };
    }
};
