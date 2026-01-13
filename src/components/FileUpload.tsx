import { Check, ChevronDown, FileSpreadsheet, InfoIcon, Loader2, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InputHeaderNames } from '@/constants';
import { ColumnsPerFileKeyMap, DependencyInputHeaderNamesPerFile, FileKey, FileToStoreIdMap } from '@/constants/files';
import { processAndVerifyFile } from '@/utils/file';

export interface FileData {
    file: File | null;
    fileKey: FileKey;
    fileName: string;
    columns: string[];
    selectedColumns: string[];
    isProcessing: boolean;
}

interface FileUploadProps {
    fileData: FileData;
    onFileDataChange: (fileData: FileData) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ fileData, onFileDataChange }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [showColumnSelector, setShowColumnSelector] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const supportedFileTypes = ['.xlsx', '.xls', '.csv'];

    const dependencyColumns = DependencyInputHeaderNamesPerFile[fileData.fileKey];

    const knownColumns = ColumnsPerFileKeyMap[fileData.fileKey].map((key) => InputHeaderNames[key]) || [];

    knownColumns.unshift(FileToStoreIdMap[fileData.fileKey]); // Add the store ID column

    if (dependencyColumns) {
        knownColumns.push(...Object.values(dependencyColumns).flatMap((obj) => Object.values(obj)));
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const invertedDependencyHeaderMap = getInvertedDependencyHeaderMap();

    function getInvertedDependencyHeaderMap(): Record<string, string> {
        const invertedMap: Record<string, string> = {};

        if (!dependencyColumns) return invertedMap;

        Object.entries(dependencyColumns).forEach(([key, value]) => {
            Object.values(value).forEach((header) => {
                invertedMap[header] = key;
            });
        });

        return invertedMap;
    }

    const processFile = async (file: File) => {
        onFileDataChange({
            file,
            fileName: fileData.fileName,
            fileKey: fileData.fileKey,
            columns: [],
            selectedColumns: [],
            isProcessing: true,
        });

        const result = await processAndVerifyFile(file, fileData.fileKey);

        if (result.error) {
            toast.error(`Error processing file`, {
                description: result.error,
                duration: 6000,
            });

            onFileDataChange({
                file: null,
                fileName: fileData.fileName,
                fileKey: fileData.fileKey,
                columns: [],
                selectedColumns: [],
                isProcessing: false,
            });

            return;
        }

        onFileDataChange({
            file,
            fileName: fileData.fileName,
            fileKey: fileData.fileKey,
            columns: result.columns!,
            selectedColumns: result.columns!,
            isProcessing: false,
        });
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files);
        const supportedFile = droppedFiles.find((file) => supportedFileTypes.some((type) => file.name.endsWith(type)));

        if (supportedFile) {
            await processFile(supportedFile);
        } else {
            toast.error('Please upload a valid Excel (.xlsx, .xls) or CSV file.');
        }
        setIsDragOver(false);
    };

    const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];

        if (selectedFile && !supportedFileTypes.some((type) => selectedFile.name.endsWith(type))) {
            toast.error('Please upload a valid Excel (.xlsx, .xls) or CSV file.');
            return;
        }

        if (selectedFile) {
            await processFile(selectedFile);
        }
    };

    const removeFile = () => {
        onFileDataChange({
            file: null,
            fileName: fileData.fileName,
            fileKey: fileData.fileKey,
            columns: [],
            selectedColumns: [],
            isProcessing: false,
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setShowColumnSelector(false);
    };

    const triggerFileInput = () => {
        if (!fileData.isProcessing) {
            fileInputRef.current?.click();
        }
    };

    const toggleColumnSelection = (column: string) => {
        const newSelectedColumns = fileData.selectedColumns.includes(column)
            ? fileData.selectedColumns.filter((col) => col !== column)
            : [...fileData.selectedColumns, column];

        onFileDataChange({
            ...fileData,
            selectedColumns: newSelectedColumns,
        });
    };

    const selectAllColumns = () => {
        onFileDataChange({
            ...fileData,
            selectedColumns: fileData.columns,
        });
    };

    const deselectAllColumns = () => {
        onFileDataChange({
            ...fileData,
            selectedColumns: [
                ...fileData.columns.filter(
                    (column) => FileToStoreIdMap[fileData.fileKey] === column || !!invertedDependencyHeaderMap[column],
                ),
            ],
        });
    };

    return (
        <div>
            <div
                className={`
					relative border-2 border-dashed rounded-xl p-6 h-30 transition-all duration-300 
					${fileData.isProcessing ? 'cursor-wait' : 'cursor-pointer'}
					${
                        isDragOver
                            ? 'border-blue-500 bg-blue-50 scale-105'
                            : fileData.file
                              ? 'border-green-400 bg-green-50'
                              : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
                    }
					shadow-sm hover:shadow-md h-48
				`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerFileInput}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileInput}
                    className="hidden"
                    disabled={fileData.isProcessing}
                />

                {fileData.isProcessing ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <Loader2 className="w-12 h-12 text-blue-600 mb-3 animate-spin" />
                        <p className="text-sm font-medium text-blue-600 mb-1">Processing file...</p>
                        <p className="text-xs text-gray-500">Reading columns from {fileData.file?.name}</p>
                    </div>
                ) : fileData.file && fileData.columns.length > 0 ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <FileSpreadsheet className="w-12 h-12 text-green-600 mb-3" />
                        <p
                            className="text-sm font-medium text-gray-900 text-center mb-1 truncate max-w-full"
                            title={fileData.file.name}
                        >
                            {fileData.file.name}
                        </p>
                        <p className="text-xs text-gray-500 mb-2">{(fileData.file.size / 1024).toFixed(1)} KB</p>
                        <p className="text-xs text-blue-600 font-medium">
                            {fileData.selectedColumns.length} of {fileData.columns.length} columns selected
                        </p>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                removeFile();
                            }}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                        <Upload className={`w-12 h-12 mb-3 ${isDragOver ? 'text-blue-600' : 'text-gray-400'}`} />
                        <p className={`text-sm font-medium mb-1 ${isDragOver ? 'text-blue-600' : 'text-gray-600'}`}>
                            Drop Excel/CSV file here
                        </p>
                        <p className="text-xs text-gray-400">or click to browse</p>
                    </div>
                )}
                <div
                    className="absolute -bottom-3 left-1/2 transform -translate-x-1/2"
                    onClick={(e) => e.stopPropagation()}
                >
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger>
                                <div className="bg-gray-700 rounded-full px-3 py-1 text-xs text-white shadow-sm border border-gray-800 font-bold flex items-center justify-center gap-1">
                                    <InfoIcon className="w-4 h-4 text-blue-200 cursor-pointer" />
                                    <span>{fileData.fileName}</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm max-h-60 overflow-y-auto text-xs text-white bg-gray-800">
                                <div className="text-left">
                                    <p className="mb-1 font-semibold">Expected Columns:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        {knownColumns.map((col, index) => (
                                            <li key={index}>{col}</li>
                                        ))}
                                    </ul>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
            <div className="relative z-20 mt-4">
                {/* Column Selector */}
                {fileData.file && fileData.columns.length > 0 && !fileData.isProcessing && (
                    <div className="mt-4 relative z-15">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowColumnSelector(!showColumnSelector);
                            }}
                            className="flex items-center justify-between w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <span className="font-medium text-gray-700">Select Columns</span>
                            <span className="flex items-center gap-1 text-gray-500">
                                {fileData.selectedColumns.length} of {fileData.columns.length}{' '}
                                <ChevronDown
                                    className={`w-4 h-4 text-gray-500 transition-transform ${
                                        showColumnSelector ? 'rotate-180' : ''
                                    }`}
                                />
                            </span>
                        </button>

                        {showColumnSelector && (
                            <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto absolute w-full">
                                <div className="p-3 border-b border-gray-200 flex gap-2">
                                    <button
                                        onClick={selectAllColumns}
                                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                    >
                                        Select All
                                    </button>
                                    <button
                                        onClick={deselectAllColumns}
                                        className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                                    >
                                        Deselect All
                                    </button>
                                </div>
                                <div className="p-2">
                                    {fileData.columns.map((column, index) => (
                                        <label
                                            key={index}
                                            className={`flex items-center p-2 hover:bg-gray-50 rounded ${
                                                FileToStoreIdMap[fileData.fileKey] === column ||
                                                !!invertedDependencyHeaderMap[column]
                                                    ? 'cursor-not-allowed'
                                                    : 'cursor-pointer'
                                            } ${
                                                knownColumns.includes(column)
                                                    ? 'bg-green-50 border border-green-200 hover:bg-green-100'
                                                    : 'bg-red-50 border border-red-200 hover:bg-red-100'
                                            }`}
                                        >
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={fileData.selectedColumns.includes(column)}
                                                    onChange={() => toggleColumnSelection(column)}
                                                    className="sr-only"
                                                    disabled={
                                                        FileToStoreIdMap[fileData.fileKey] === column ||
                                                        !!invertedDependencyHeaderMap[column]
                                                    }
                                                />
                                                <div
                                                    className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-colors ${
                                                        fileData.selectedColumns.includes(column)
                                                            ? 'bg-blue-600 border-blue-600'
                                                            : 'border-gray-300'
                                                    } ${
                                                        FileToStoreIdMap[fileData.fileKey] === column ||
                                                        !!invertedDependencyHeaderMap[column]
                                                            ? 'bg-gray-300 cursor-not-allowed border-gray-300'
                                                            : 'cursor-pointer'
                                                    }`}
                                                >
                                                    {fileData.selectedColumns.includes(column) && (
                                                        <Check className="w-3 h-3 text-white" />
                                                    )}
                                                </div>
                                            </div>
                                            <span className="ml-3 text-sm text-gray-700">{column}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
