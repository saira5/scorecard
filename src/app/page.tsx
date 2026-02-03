'use client';

import { format } from 'date-fns';
import ExcelJs from 'exceljs';
import { ChevronDown, ChevronUp, Loader2, Plus, Save } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { toast } from 'sonner';

import { uploadReport } from '@/actions/report';
import { FileData, FileUpload } from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import { FileKey } from '@/constants/files';
import { generateReportFileName, getLocalDate } from '@/utils';
import { downloadWorkbook, generateReport, processAndVerifyFile } from '@/utils/file';

export default function ExcelFilesMerger() {
    const getDefaultFileData = (fileName: string, fileKey: FileKey) => ({
        file: null,
        fileName: fileName,
        fileKey: fileKey,
        columns: [],
        selectedColumns: [],
        isProcessing: false,
    });

    const [qsrSalesFileData, setQsrSalesFileData] = useState<FileData>(
        getDefaultFileData('Sales File', FileKey.QSR_SALES),
    );
    const [qsrServiceFileData, setQsrServiceFileData] = useState<FileData>(
        getDefaultFileData('Service File', FileKey.QSR_SERVICE),
    );
    const [qsrLaborFileData, setQsrLaborFileData] = useState<FileData>(
        getDefaultFileData('Labor File', FileKey.QSR_LABOR),
    );
    const [qsrDeliveryFileData, setQsrDeliveryFileData] = useState<FileData>(
        getDefaultFileData('Delivery File', FileKey.QSR_DELIVERY),
    );
    const [qsrDigitalAppFileData, setQsrDigitalAppFileData] = useState<FileData>(
        getDefaultFileData('Digital App File', FileKey.QSR_DIGITAL_APP),
    );

    const [qsrFoodCostFileData, setQsrFoodCostFileData] = useState<FileData>(
        getDefaultFileData('Food Cost File', FileKey.QSR_FOOD_COST),
    );

    const [voiceFileData, setVoiceFileData] = useState<FileData>(getDefaultFileData('Voice File', FileKey.VOICE));

    const [doorDashFileData, setDoorDashFileData] = useState<FileData>(
        getDefaultFileData('Door Dash File', FileKey.DOORDASH),
    );

    const [benchmarkFileData, setBenchmarkFileData] = useState<FileData>(
        getDefaultFileData('Benchmark File', FileKey.BENCHMARK),
    );
    const [rhmcFileData, setRhmcFileData] = useState<FileData>(getDefaultFileData('RHMC File', FileKey.RHMC));

    const [normFileData, setNormFileData] = useState<FileData>(getDefaultFileData('Norm File', FileKey.NORM));

    useEffect(() => {
        preLoadNormFile();
    }, []);

    const allFilesData = [
        qsrSalesFileData,
        qsrServiceFileData,
        qsrLaborFileData,
        qsrDigitalAppFileData,
        qsrDeliveryFileData,
        qsrFoodCostFileData,
        voiceFileData,
        doorDashFileData,
        // benchmarkFileData,
        normFileData,
        rhmcFileData,
    ];

    const qsrFilesData = [
        qsrSalesFileData,
        qsrServiceFileData,
        qsrLaborFileData,
        qsrDigitalAppFileData,
        qsrDeliveryFileData,
        qsrFoodCostFileData,
    ];
    const voiceFilesData = [voiceFileData];
    const doorDashFilesData = [doorDashFileData];
    const benchmarkFilesData = [benchmarkFileData];
    const normFilesData = [normFileData];
    const rhmcFilesData = [rhmcFileData];

    const mandatoryFilesData: FileData[] = [...allFilesData];
    // const mandatoryFilesData: FileData[] = [];

    const downloadRef = useRef<HTMLDivElement | null>(null);

    const [isProcessing, setIsProcessing] = useState(false);
    const [isDownloadingXLSX, setIsDownloadingXLSX] = useState(false);
    const [isSavingReport, setIsSavingReport] = useState(false);

    const [workbook, setWorkbook] = useState<ExcelJs.Workbook | null>(null);
    const [outputLogs, setOutputLogs] = useState<Record<FileKey, string[]> | null>(null);
    const [showLogs, setShowLogs] = useState(true);

    const [dateRange, setDateRange] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection',
        },
    ]);

    const processingCount = allFilesData.filter((data) => data.isProcessing).length;

    async function preLoadNormFile() {
        const response = await fetch(`/data/norm.xlsx`);

        if (!response.ok) {
            toast.error(`Failed to load norm file`);
            return;
        }

        const fileBuffer = await response.arrayBuffer();

        const file = new File([fileBuffer], 'norm.xlsx', {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        setNormFileData({
            file,
            fileName: normFileData.fileName,
            fileKey: normFileData.fileKey,
            columns: [],
            selectedColumns: [],
            isProcessing: true,
        });

        const result = await processAndVerifyFile(file, normFileData.fileKey);

        if (result.error) {
            toast.error(`Error processing file`, {
                description: result.error,
                duration: 6000,
            });

            setNormFileData({
                file: null,
                fileName: normFileData.fileName,
                fileKey: normFileData.fileKey,
                columns: [],
                selectedColumns: [],
                isProcessing: false,
            });

            return;
        }

        setNormFileData({
            file,
            fileName: normFileData.fileName,
            fileKey: normFileData.fileKey,
            columns: result.columns!,
            selectedColumns: result.columns!,
            isProcessing: false,
        });
    }

    const getDateRangeString = () => {
        return `${format(dateRange[0].startDate, 'dd MMM, yyyy')} - ${format(dateRange[0].endDate, 'dd MMM, yyyy')}`;
    };

    const handleMerge = async () => {
        setIsProcessing(true);

        const filesWithData = allFilesData.filter((data) => data.file !== null && !data.isProcessing);

        const processingFiles = allFilesData.filter((data) => data.isProcessing);

        if (processingFiles.length > 0) {
            toast.error('Please wait for all files to finish processing before merging.');
            setIsProcessing(false);
            return;
        }

        if (!areAllMandatoryFilesSelected()) {
            toast.error('Please upload all mandatory files before merging.');
            setIsProcessing(false);
            return;
        }

        toast.success(`Successfully prepared to merge ${filesWithData.length} files with selected columns!`);

        try {
            const result = await generateReport(
                filesWithData.map((data) => ({
                    file: data.file!,
                    fileKey: data.fileKey,
                    selectedColumns: data.selectedColumns,
                    allColumns: data.columns,
                })),
                getDateRangeString(),
            );

            if ('error' in result) {
                toast.error(result.error);
            } else {
                setWorkbook(result.workbook);
                setOutputLogs(result.logs);

                toast.success('Merged file is ready for download!');

                setTimeout(() => {
                    downloadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 200);
            }
        } catch (error) {
            toast.error('An unexpected error occurred during merging.');
            console.error(error);
        }

        setIsProcessing(false);
    };

    const handleDownload = async (type: 'xlsx' | 'pdf') => {
        if (!workbook) return;

        const localDate = getLocalDate();
        const startDate = dateRange[0].startDate.toLocaleDateString();
        const endDate = dateRange[0].endDate.toLocaleDateString();
        const fileName = generateReportFileName(1, startDate, endDate);

        if (type === 'xlsx') {
            setIsDownloadingXLSX(true);

            await downloadWorkbook(workbook, fileName);

            setIsDownloadingXLSX(false);
        } else if (type === 'pdf') {
        }

        toast.success(`File downloaded as ${fileName}`);
    };

    const handleSave = async () => {
        if (isSavingReport) return;

        setIsSavingReport(true);

        if (!workbook) return toast.error('No workbook to save.');

        try {
            const fileBuffer = await workbook.xlsx.writeBuffer();
            const fileBufferString = Buffer.from(fileBuffer).toString('base64');

            const result = await uploadReport(fileBufferString, getDateRangeString());

            if (result.success) {
                toast.success('Report saved successfully!');
            } else {
                toast.error(result.error || 'Failed to save report.');
            }
        } catch (err) {
            console.error(err);
            toast.error('Unexpected error while saving report.');
        }

        setIsSavingReport(false);
    };

    const resetFileData = (fileData: FileData) => {
        return {
            ...fileData,
            file: null,
            columns: [],
            selectedColumns: [],
            isProcessing: false,
        };
    };

    const getSelectedFilesCount = (selectedFiles: FileData[]) => {
        return selectedFiles.filter((data) => data.file !== null && !data.isProcessing).length;
    };

    const areAllMandatoryFilesSelected = () => {
        return mandatoryFilesData.every((data) => data.file !== null);
    };
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-6 pb-40 mt-5">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">MC Report Generator</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Upload your Excel or CSV files, select the columns you want to include, and merge them into one
                        file (in a predetermined format).
                    </p>
                </div>

                {/* File Upload Areas */}
                <div className="z-8 mb-12 grid grid-cols-6 gap-6">
                    {/* QSR Soft Files Section */}
                    <div className="bg-zinc-50 rounded-xl p-6 shadow-sm border border-gray-200 mb-4 col-span-6 flex flex-col justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                                Upload QSR Soft Files
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-2 gap-6 mb-6">
                                <FileUpload fileData={qsrSalesFileData} onFileDataChange={setQsrSalesFileData} />
                                <FileUpload fileData={qsrServiceFileData} onFileDataChange={setQsrServiceFileData} />
                                <FileUpload fileData={qsrLaborFileData} onFileDataChange={setQsrLaborFileData} />
                                <FileUpload fileData={qsrDeliveryFileData} onFileDataChange={setQsrDeliveryFileData} />
                                <FileUpload
                                    fileData={qsrDigitalAppFileData}
                                    onFileDataChange={setQsrDigitalAppFileData}
                                />
                                <FileUpload fileData={qsrFoodCostFileData} onFileDataChange={setQsrFoodCostFileData} />
                            </div>
                        </div>

                        {getSelectedFilesCount(qsrFilesData) > 0 && (
                            <div className="flex justify-center">
                                <Button
                                    variant="ghost"
                                    className="border border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 font-medium px-4 py-2 rounded-md transition"
                                    onClick={() => {
                                        setQsrSalesFileData(resetFileData(qsrSalesFileData));
                                        setQsrServiceFileData(resetFileData(qsrServiceFileData));
                                        setQsrLaborFileData(resetFileData(qsrLaborFileData));
                                        setQsrDeliveryFileData(resetFileData(qsrDeliveryFileData));
                                        setQsrDigitalAppFileData(resetFileData(qsrDigitalAppFileData));
                                        setQsrFoodCostFileData(resetFileData(qsrFoodCostFileData));
                                    }}
                                >
                                    Reset QSR Files
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Voice Files Section */}
                    <div className="bg-zinc-50 rounded-xl p-6 shadow-sm border border-gray-200 mb-4 md:col-span-3 col-span-6 flex flex-col justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                                Upload Voice Files
                            </h2>
                            <div className="grid grid-cols-1 gap-6 mb-6">
                                <FileUpload fileData={voiceFileData} onFileDataChange={setVoiceFileData} />
                            </div>
                        </div>

                        {getSelectedFilesCount(voiceFilesData) > 0 && (
                            <div className="flex justify-center">
                                <Button
                                    variant="ghost"
                                    className="border border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 font-medium px-4 py-2 rounded-md transition"
                                    onClick={() => setVoiceFileData(resetFileData(voiceFileData))}
                                >
                                    Reset Voice Files
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Door Dash Files Section */}
                    <div className="bg-zinc-50 rounded-xl p-6 shadow-sm border border-gray-200 mb-4 md:col-span-3 col-span-6 flex flex-col justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                                Upload Door Dash Files
                            </h2>
                            <div className="grid grid-cols-1 gap-6 mb-6">
                                <FileUpload fileData={doorDashFileData} onFileDataChange={setDoorDashFileData} />
                            </div>
                        </div>

                        {getSelectedFilesCount(doorDashFilesData) > 0 && (
                            <div className="flex justify-center">
                                <Button
                                    variant="ghost"
                                    className="border border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 font-medium px-4 py-2 rounded-md transition"
                                    onClick={() => setDoorDashFileData(resetFileData(doorDashFileData))}
                                >
                                    Reset Door Dash Files
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Benchmark Files Section */}
                    {/* <div className="bg-zinc-50 rounded-xl p-6 shadow-sm border border-gray-200 mb-4 col-span-3 flex flex-col justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                                Upload Benchmark Files
                            </h2>
                            <div className="grid grid-cols-1 gap-6 mb-6">
                                <FileUpload fileData={benchmarkFileData} onFileDataChange={setBenchmarkFileData} />
                            </div>
                        </div>

                        {getSelectedFilesCount(benchmarkFilesData) > 0 && (
                            <div className="flex justify-center">
                                <Button
                                    variant="ghost"
                                    className="border border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 font-medium px-4 py-2 rounded-md transition"
                                    onClick={() => setBenchmarkFileData(resetFileData(benchmarkFileData))}
                                >
                                    Reset Benchmark Files
                                </Button>
                            </div>
                        )}
                    </div> */}

                    {/* Norm Files Section */}
                    <div className="bg-zinc-50 rounded-xl p-6 shadow-sm border border-gray-200 mb-4 md:col-span-3 col-span-6 flex flex-col justify-between">
                        <div>
                            <div className="grid grid-cols-4">
                                <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center col-span-2 col-start-2">
                                    Upload Norm Files
                                </h2>
                                <div className="flex mb-4 col-span-1 col-start-4 justify-end">
                                    <Button
                                        variant="outline"
                                        className="border border-gray-700 text-gray-900 hover:bg-gray-100 font-medium px-4 py-2 rounded-md transition"
                                        disabled={normFileData.isProcessing}
                                        onClick={preLoadNormFile}
                                    >
                                        Load
                                    </Button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-6 mb-6">
                                <FileUpload fileData={normFileData} onFileDataChange={setNormFileData} />
                            </div>
                        </div>

                        {getSelectedFilesCount(normFilesData) > 0 && (
                            <div className="flex justify-center">
                                <Button
                                    variant="ghost"
                                    className="border border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 font-medium px-4 py-2 rounded-md transition"
                                    onClick={() => setNormFileData(resetFileData(normFileData))}
                                >
                                    Reset Norm Files
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* RHMC Files Section */}
                    <div className="bg-zinc-50 rounded-xl p-6 shadow-sm border border-gray-200 mb-4 md:col-span-3 col-span-6 flex flex-col justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Upload RHMC Files</h2>
                            <div className="grid grid-cols-1 gap-6 mb-6">
                                <FileUpload fileData={rhmcFileData} onFileDataChange={setRhmcFileData} />
                            </div>
                        </div>

                        {getSelectedFilesCount(rhmcFilesData) > 0 && (
                            <div className="flex justify-center">
                                <Button
                                    variant="ghost"
                                    className="border border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 font-medium px-4 py-2 rounded-md transition"
                                    onClick={() => setRhmcFileData(resetFileData(rhmcFileData))}
                                >
                                    Reset RHMC Files
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 rounded-xl shadow mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Select Report Date Range</h2>
                    <div className="flex justify-center">
                        <DateRange
                            onChange={(item: any) => setDateRange([item.selection])}
                            moveRangeOnFirstSelection={false}
                            ranges={dateRange}
                        />
                    </div>
                </div>

                {/* Merge Button */}
                <div className="text-center">
                    <button
                        onClick={handleMerge}
                        disabled={
                            getSelectedFilesCount(allFilesData) < 1 || isProcessing || !areAllMandatoryFilesSelected()
                        }
                        className={`
								inline-flex items-center px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 
								${getSelectedFilesCount(allFilesData) >= 1 &&
                                processingCount === 0 &&
                                !isProcessing &&
                                areAllMandatoryFilesSelected()
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        {processingCount > 0 || isProcessing ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Processing Files...
                            </>
                        ) : (
                            <>
                                <Plus className="w-5 h-5 mr-2" />
                                Generate Report for Selected Columns
                            </>
                        )}
                    </button>
                </div>

                {/* Download Section */}
                {workbook && (
                    <div ref={downloadRef} className="text-center mt-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Download Merged File</h3>
                        <div className="space-x-4 flex justify-center">
                            <button
                                onClick={() => handleDownload('xlsx')}
                                disabled={isDownloadingXLSX}
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all shadow disabled:bg-gray-300 disabled:text-gray-500"
                            >
                                <div className="flex items-center">
                                    {isDownloadingXLSX ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        'Download as XLSX'
                                    )}
                                </div>
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 bg-slate-700 hover:bg-slate-800 text-white font-medium rounded-lg shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isSavingReport}
                            >
                                {isSavingReport ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <div className="flex items-center">
                                        <Save className="w-5 h-5 mr-2 inline-block" />
                                        <span>Save Report</span>
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Output Logs Section */}
                {outputLogs && (
                    <div className="max-w-3xl mx-auto mt-12 bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-gray-800">Output Logs</h3>
                            <button
                                onClick={() => setShowLogs(!showLogs)}
                                className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-all"
                            >
                                {showLogs ? (
                                    <>
                                        <ChevronUp className="w-4 h-4 mr-1" />
                                        Hide Logs
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="w-4 h-4 mr-1" />
                                        Show Logs
                                    </>
                                )}
                            </button>
                        </div>

                        {showLogs && (
                            <>
                                <hr className="my-4 border-gray-200" />
                                <div className="mt-6">
                                    {Object.entries(outputLogs).map(([fileKey, logs]) => (
                                        <div key={fileKey} className="mb-6">
                                            <h4 className="text-md font-bold text-blue-700 mb-2">{fileKey}</h4>
                                            <ul className="space-y-1">
                                                {logs.map((log, idx) => {
                                                    let logStyle = 'text-gray-700';
                                                    if (log.startsWith('ERROR'))
                                                        logStyle = 'text-red-600 font-semibold';
                                                    else if (log.startsWith('WARN'))
                                                        logStyle = 'text-yellow-600 font-medium';
                                                    else if (log.startsWith('SUCCESS'))
                                                        logStyle = 'text-green-600 font-medium';

                                                    return (
                                                        <li key={idx} className={`text-sm ${logStyle}`}>
                                                            {log}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                            {logs.length === 0 && (
                                                <p className="text-sm text-gray-500">
                                                    No logs available for this file.
                                                </p>
                                            )}
                                            <hr className="my-4 border-gray-200" />
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div >
    );
}
