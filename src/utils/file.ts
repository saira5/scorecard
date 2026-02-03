import ExcelJs, { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';
import { read, Sheet, utils } from 'xlsx-js-style';

import { createMergedHeader, isNumericOrPercentage, isStars } from '.';
import { applyBannerStylingToWorkbook, applyStylingToWorksheet } from './styling';
import { InputHeaderNames, SubHeaderKey, SubHeaderNames } from '@/constants';
import {
    ColumnsPerFileKeyMap,
    DependencyInputHeaderNamesPerFile,
    FileConfig,
    FileKey,
    FileToStoreIdMap,
} from '@/constants/files';
import { OrderedStores, PersonName } from '@/constants/stores';
import { getTableFormatWithRowColumnMap } from '@/utils/format';

export const processAndVerifyFile = async (file: File | null, fileKey: FileKey) => {
    try {
        if (!file) {
            return { error: 'No file provided' };
        }

        const data = await file.arrayBuffer();
        const workbook = read(data);
        const sheetNames = workbook.SheetNames;

        if (sheetNames.length === 0) {
            return { error: 'No sheets found in the file' };
        }

        const firstSheet = preProcessSheet(workbook.Sheets[sheetNames[0]], fileKey);
        const jsonData = utils.sheet_to_json(firstSheet, {
            header: 1,
            range: FileConfig[fileKey].headerRow,
        });
        const headersRaw = (jsonData[0] as string[]) || [];

        const headers = headersRaw.map((header) => header?.trim()).filter((header) => header);

        if (!headers.find((header) => header === FileToStoreIdMap[fileKey])) {
            return { error: `Missing Store ID header: ${FileToStoreIdMap[fileKey]}` };
        }

        return { columns: headers };
    } catch (error) {
        console.error('Error processing file:', error);
        return { error: 'Failed to process file' };
    }
};

const preProcessSheet = (sheet: Sheet, fileKey: FileKey): Sheet => {
    const fileConfig = FileConfig[fileKey];

    if (fileConfig.superHeaderRow === null) return sheet;

    const jsonData = utils.sheet_to_json(sheet, {
        header: 1,
        raw: false,
    });

    const superHeaderRow = jsonData[fileConfig.superHeaderRow] as string[] | undefined;
    const headerRow = jsonData[fileConfig.headerRow] as string[] | undefined;

    if (!superHeaderRow || !headerRow) {
        console.error('Invalid super header or header row: ' + fileKey);
        return sheet;
    }

    const mergedHeaders: string[] = [];

    let currentSuperHeader: string | null = null;

    for (let i = 0; i < headerRow.length; i++) {
        const header = headerRow[i].trim();

        if (superHeaderRow[i] && superHeaderRow[i]?.trim() !== currentSuperHeader) {
            currentSuperHeader = superHeaderRow[i].trim();
        }

        if (header) {
            mergedHeaders.push(createMergedHeader(currentSuperHeader, header));
        } else {
            mergedHeaders.push(''); // Keep empty headers for alignment
        }
    }

    jsonData[fileConfig.headerRow] = mergedHeaders;

    const newSheet = utils.aoa_to_sheet(jsonData as string[][]);

    newSheet['!ref'] = sheet['!ref'];
    newSheet['!merges'] = sheet['!merges'] || [];

    return newSheet;
};

interface ColumnMerge {
    s: { r: number; c: number };
    e: { r: number; c: number };
}

const calculateHeaderMerges = (table: string[][]): ColumnMerge[] => {
    const merges: ColumnMerge[] = [];
    let tempMerge: ColumnMerge | null = null;
    let key: string | null = null;

    table[0].forEach((val, i) => {
        if (!key) {
            key = val;
            tempMerge = { s: { r: 0, c: i }, e: { r: 0, c: i } };
            return;
        }

        if (val === key) {
            tempMerge!.e.c = i;
        } else {
            if (tempMerge) merges.push(tempMerge);
            key = val;
            tempMerge = { s: { r: 0, c: i }, e: { r: 0, c: i } };
        }
    });

    if (tempMerge) merges.push(tempMerge);

    return merges;
};

interface FileWithColumns {
    file: File;
    fileKey: FileKey;
    selectedColumns: string[];
    allColumns: string[];
}

const formatStoreId = (storeId: string | null | undefined, fileKey: FileKey): string | null | undefined => {
    if (!storeId) return null;

    switch (fileKey) {
        case FileKey.QSR_SALES:
        case FileKey.QSR_SERVICE:
        case FileKey.QSR_LABOR:
        case FileKey.QSR_DELIVERY:
        case FileKey.QSR_DIGITAL_APP:
        case FileKey.QSR_FOOD_COST:
            return storeId.match(/^\d+/)?.[0].trim();
        case FileKey.VOICE:
            return storeId.match(/^\d+/)?.[0].trim().replace(/^0*/, ''); // Removes leading zeros
        case FileKey.DOORDASH:
            return storeId.trim();
        case FileKey.NORM:
            return storeId.trim();
        case FileKey.BENCHMARK:
            return storeId.trim();
        case FileKey.RHMC:
            return storeId.match(/^\d+/)?.[0].trim();
        default:
            return null;
    }
};

const formatCellValue = (value: string | null | undefined, fileKey: FileKey): string | null => {
    if (!value) return null;

    if (fileKey === FileKey.NORM) return `${value.trim()}%`;

    return value.trim().replace(/[$,]/g, '');
};

const getUnselectedKnownColumnKeys = (filesData: FileWithColumns[]): SubHeaderKey[] => {
    const unselectedKnownColumnKeys: SubHeaderKey[] = [];

    for (const { fileKey, selectedColumns, allColumns } of filesData) {
        const unSelectedColumns = allColumns.filter((col) => !selectedColumns.includes(col));

        const knownColumnKeys = ColumnsPerFileKeyMap[fileKey];

        unselectedKnownColumnKeys.push(
            ...knownColumnKeys.filter((colKey) => unSelectedColumns.includes(InputHeaderNames[colKey] as string)),
        );
    }

    return unselectedKnownColumnKeys;
};

export async function generateReport(
    filesData: FileWithColumns[],
    reportDateRange: string,
): Promise<{ workbook: ExcelJs.Workbook; logs: Record<FileKey, string[]> } | { error: string }> {
    try {
        const logs: Record<FileKey, string[]> = {} as Record<FileKey, string[]>;
        const filteredLogs: Record<FileKey, string[]> = {} as Record<FileKey, string[]>;

        const unselectedKnownColumnKeys = getUnselectedKnownColumnKeys(filesData);

        const { table, numColumns, numRows, columnIdMap, rowIdMap, numHeaderRows } =
            getTableFormatWithRowColumnMap(unselectedKnownColumnKeys);

        for (const { file, selectedColumns, fileKey } of filesData) {
            logs[fileKey] = ['SUCCESS: Started Processing file'];
            filteredLogs[fileKey] = [];

            const arrayBuffer = await file.arrayBuffer();
            const fileWorkbook = read(arrayBuffer);
            const sheetName = fileWorkbook.SheetNames[0];
            const sheet = preProcessSheet(fileWorkbook.Sheets[sheetName], fileKey);
            const json = utils.sheet_to_json(sheet, {
                raw: false,
                range: FileConfig[fileKey].headerRow,
            }) as Record<string, any>[];

            const knownColumns = ColumnsPerFileKeyMap[fileKey];

            let successRowCount = 0;

            json.forEach((rowRaw) => {
                const row: Record<string, string | null | undefined> = {};

                for (const col of Object.keys(rowRaw)) {
                    const trimmedCol = col.trim();
                    row[trimmedCol] = rowRaw[col] ? rowRaw[col].toString().trim() : rowRaw[col];
                }

                const storeIdFieldName = FileToStoreIdMap[fileKey];
                const storeIdRaw: string | null | undefined = row[storeIdFieldName]?.toString();
                const storeId = formatStoreId(storeIdRaw, fileKey);

                if (!storeId) {
                    logs[fileKey].push(
                        `WARN: Failed to extract Store ID from cell with text: "${storeIdRaw}" - SKIPPING row`,
                    );
                    logs[fileKey].push(`Row: ${JSON.stringify(Object.values(row), null, 2)} #private`);
                    logs[fileKey].push(`#private`);

                    return;
                }

                // Skip rows with person names in the NORM file
                if (fileKey === FileKey.NORM && /^[a-z]+$/i.test(storeId)) {
                    logs[fileKey].push(`INFO: Person Row: "${storeId}" - SKIPPING`);

                    return;
                }

                const rowIndex = rowIdMap[storeId];

                if (rowIndex === undefined) {
                    logs[fileKey].push(`WARN: Store ID "${storeId}" not found in pre-defined store IDs - SKIPPING row`);

                    return;
                }

                successRowCount++;

                for (const col of selectedColumns) {
                    let colKey: SubHeaderKey | null | undefined = null;
                    if ((colKey = knownColumns.find((c) => InputHeaderNames[c] === col))) {
                        const columnIndex = columnIdMap[colKey];

                        if (columnIndex === undefined) {
                            logs[fileKey].push(
                                `ERROR: Column "${col}" not found in pre-defined columns - SKIPPING column`,
                            );
                            continue;
                        }

                        let cellValue = formatCellValue(row[col], fileKey) || '';

                        if (!cellValue) continue;

                        const dependencyColumns = DependencyInputHeaderNamesPerFile[fileKey];

                        if (dependencyColumns && colKey in dependencyColumns && fileKey === FileKey.BENCHMARK) {
                            const { OPP_DOLLAR, OPP_PERCENT } = dependencyColumns[colKey];

                            if (!row[OPP_DOLLAR] || !row[OPP_PERCENT]) continue;

                            const oppDollarValue = row[OPP_DOLLAR]?.toString().trim() || '';
                            const oppPercentValue = row[OPP_PERCENT]?.toString().trim() || '';

                            if (oppDollarValue && oppPercentValue && !/(^-$)|(^\(.+\)$)/.test(oppDollarValue)) {
                                const parsedCellValue = parseFloat(cellValue.replace('%', ''));
                                const parsedOppPercentValue = parseFloat(oppPercentValue.replace('%', ''));

                                if (
                                    isNaN(parsedCellValue) ||
                                    isNaN(parsedOppPercentValue) ||
                                    !cellValue.endsWith('%') ||
                                    !oppPercentValue.endsWith('%')
                                ) {
                                    logs[fileKey].push(
                                        `ERROR: Invalid percentage format in cell "${cellValue}" or "${oppPercentValue}" - SKIPPING CELL`,
                                    );
                                    continue;
                                }

                                cellValue = `${parsedCellValue - parsedOppPercentValue}%`;
                            }
                        }

                        if (table[rowIndex][columnIndex]) {
                            logs[fileKey].push(
                                `ERROR: Cell for store ID "${storeId}", and column "${SubHeaderNames[colKey]}" already has value: ${table[rowIndex][columnIndex]} - SKIPPING CELL`,
                            );
                            continue;
                        }

                        if (!isNumericOrPercentage(cellValue) && !isStars(cellValue)) {
                            console.warn(
                                `WARN: FILE_KEY: ${fileKey} -- Cell for store ID "${storeId}", and column "${SubHeaderNames[colKey]}" has a non-numeric and non-stars value: "${cellValue}" - SKIPPING CELL`,
                            );
                            continue;
                        }

                        table[rowIndex][columnIndex] = cellValue;
                    }
                }
            });

            logs[fileKey].push(`SUCCESS: Added ${successRowCount} rows out of ${json.length}`);
            filteredLogs[fileKey] = [...logs[fileKey].filter((c) => !c.endsWith('#private'))];
        }

        // calculate average for each person
        for (const key of Object.values(SubHeaderKey)) {
            if (key === SubHeaderKey.SALES__STORES) {
                continue; // Skip the "STORES" column
            }

            const columnIndex = columnIdMap[key];

            if (columnIndex === undefined) continue;

            let total = 0;
            let count = 0;
            let isPercentageColumn = null;

            for (let r = 0; r < numRows; r++) {
                const storeId = table[r][0];

                if (!OrderedStores.includes(storeId)) continue;

                const cellValue = table[r][columnIndex]?.trim();

                if (Object.values(PersonName).includes(storeId as PersonName)) {
                    if (count > 0) {
                        const average = (isPercentageColumn ? (total / count) * 100 : total / count).toFixed(2);

                        table[r][columnIndex] = isPercentageColumn ? `${average}%` : average;
                    }

                    total = 0;
                    count = 0;
                    isPercentageColumn = null;
                    continue;
                }

                if (!cellValue || isStars(cellValue)) {
                    continue;
                }

                if (isPercentageColumn === null) {
                    isPercentageColumn = cellValue.endsWith('%');
                } else if (isPercentageColumn !== cellValue.endsWith('%')) {
                    console.error(`Inconsistent percentage format in column "${SubHeaderNames[key]}"`);
                    // continue;
                }

                const numericValue: number = isPercentageColumn
                    ? parseFloat(cellValue.replace('%', '')) / 100
                    : parseFloat(cellValue);

                if (isNaN(numericValue)) {
                    console.error(`Invalid numeric value "${cellValue}" in column "${SubHeaderNames[key]}"`);
                }

                count++;
                total += numericValue;
            }
        }

        const worksheet = utils.aoa_to_sheet(table);

        applyStylingToWorksheet(worksheet, columnIdMap);

        const merges = calculateHeaderMerges(table);

        worksheet['!merges'] = merges;
        worksheet['!ref'] = `A1:${utils.encode_cell({ r: numRows - 1, c: numColumns - 1 })}`;

        const xlsxWorkbook = utils.book_new();
        utils.book_append_sheet(xlsxWorkbook, worksheet, 'Report');

        const excelJsWorkbook = await applyBannerStylingToWorkbook(
            xlsxWorkbook,
            columnIdMap,
            numHeaderRows,
            reportDateRange,
        );

        if (!excelJsWorkbook) {
            throw new Error('Failed to apply banner styling to workbook');
        }

        return { workbook: excelJsWorkbook, logs: filteredLogs };
    } catch (err) {
        console.error('Merge error:', err);
        return { error: 'Failed to merge columns' };
    }
}

export const downloadWorkbook = async (workbook: Workbook, fileName: string) => {
    const buffer = await workbook.xlsx.writeBuffer();

    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    saveAs(blob, fileName);
};
