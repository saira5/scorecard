'use client';

import ExcelJs from 'exceljs';
import { ChevronLeft, ChevronRight, Download, FileText } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { deleteReport } from '@/actions/report';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ReportData } from '@/models/Report';
import { downloadWorkbook } from '@/utils/file';

interface ReportsPageProps {
    initialReports: ReportData[];
}

export default function ReportsPageClient({ initialReports }: ReportsPageProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isDeleting, setIsDeleting] = useState(false);
    const [reports, setReports] = useState<ReportData[]>(initialReports);

    const totalPages = Math.ceil(reports.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentReports = reports.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(totalPages, page)));
    };

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
    };
    const formatDate = (date: Date) => {
        try {
            return date.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
        } catch (_error) {
            return '--/--/----';
        }
    };

    const formatTime = (date: Date) => {
        try {
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            });
        } catch (_error) {
            return '--:--';
        }
    };

    const handleDownload = async (report: ReportData) => {
        try {
            const buffer = Buffer.from(report.fileBufferString, 'base64');

            const workbook = new ExcelJs.Workbook();
            await workbook.xlsx.load(buffer as any);

            const filename = report.filename;

            await downloadWorkbook(workbook, filename);
        } catch (error) {
            console.error('Download failed:', error);
            toast.error('Failed to download the report. Please try again later.');
        }
    };

    const handleDelete = async (reportId: string) => {
        if (isDeleting) return;

        setIsDeleting(true);
        try {
            await deleteReport(reportId);

            setReports(reports.filter((report) => report.id !== reportId));

            toast.success('Report deleted successfully');
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error('Failed to delete the report. Please try again later.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
                <p className="text-muted-foreground mt-2">Manage and download your generated reports</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            All Reports ({reports.length})
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Show:</span>
                            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                                <SelectTrigger className="w-20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                            <span className="text-sm text-muted-foreground">per page</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {reports.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-muted-foreground">No reports found</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Reports will appear here once they are generated
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">Serial No.</TableHead>
                                        <TableHead>Filename</TableHead>
                                        <TableHead className="w-[240px]">Report Date Range</TableHead>
                                        <TableHead className="w-[140px]">Created Date</TableHead>
                                        <TableHead className="w-[120px]">Created Time</TableHead>
                                        <TableHead className="w-[140px]">Download</TableHead>
                                        <TableHead className="w-[80px]">Delete</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentReports.map((report, index) => (
                                        <TableRow key={report.id} className="hover:bg-muted/50">
                                            <TableCell className="font-medium">{startIndex + index + 1}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                    <span className="truncate max-w-[300px]" title={report.filename}>
                                                        {report.filename}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {report.dateRangeString}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {formatDate(report.createdAt)}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {formatTime(report.createdAt)}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDownload(report)}
                                                    className="gap-2"
                                                >
                                                    <Download className="h-4 w-4" />
                                                    Download
                                                </Button>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    className="border border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 transition gap-4 disabled:opacity-50 disabled:pointer-events-none"
                                                    size="sm"
                                                    disabled={isDeleting}
                                                    onClick={() => {
                                                        handleDelete(report.id);
                                                    }}
                                                >
                                                    Delete
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {reports.length > 0 && (
                        <div className="flex items-center justify-between mt-6 pt-4 border-t">
                            <div className="text-sm text-muted-foreground">
                                Showing {startIndex + 1} to {Math.min(endIndex, reports.length)} of {reports.length}{' '}
                                reports
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="gap-1"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNumber;
                                        if (totalPages <= 5) {
                                            pageNumber = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNumber = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNumber = totalPages - 4 + i;
                                        } else {
                                            pageNumber = currentPage - 2 + i;
                                        }

                                        return (
                                            <Button
                                                key={pageNumber}
                                                variant={currentPage === pageNumber ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => goToPage(pageNumber)}
                                                className="w-8 h-8 p-0"
                                            >
                                                {pageNumber}
                                            </Button>
                                        );
                                    })}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="gap-1"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
