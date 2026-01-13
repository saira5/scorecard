import mongoose, { model, Schema } from 'mongoose';

import { getLocalDate } from '@/utils';

export interface ReportDocument {
    _id: mongoose.Types.ObjectId;
    filename: string;
    fileBufferString: string;
    contentType: string;
    reportNumber: number;
    dateRangeString: string;
    createdDate: string;
    createdAt: Date;
    updatedAt: Date;
    __v: number;
}

export type ReportData = Omit<ReportDocument, '_id'> & {
    id: string;
};

const ReportSchema = new Schema<ReportDocument>(
    {
        filename: {
            type: String,
            required: [true, 'Filename is required'],
            trim: true,
        },
        fileBufferString: {
            type: String,
            required: [true, 'File buffer string is required'],
        },
        contentType: {
            type: String,
            required: [true, 'Content type is required'],
        },
        dateRangeString: {
            type: String,
            required: [true, 'Date range string is required'],
            trim: true,
        },
        createdDate: {
            type: String,
            required: [true, 'Created date is required'],
            default: () => getLocalDate(),
        },
        reportNumber: {
            type: Number,
            required: [true, 'Report number is required'],
            default: 1,
        },
    },
    {
        timestamps: true,
    },
);

const Report = mongoose.models?.Report || model<ReportDocument>('Report', ReportSchema);

export default Report;
