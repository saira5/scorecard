import ExcelJs from 'exceljs';
import { WorkBook, WorkSheet } from 'xlsx-js-style';

import { getColumnLetterFromIndex, getColumnIndexFromLetter, isNumericOrPercentage, isStars } from '.';
import { getReverseColumnIdMap } from './format';
import { SubHeaderKey } from '@/constants';
import { PersonName } from '@/constants/stores';
import { OptimalDirection, WmTargetsSubHeader } from '@/constants/wmTarget';

interface XlsxCellStyle {
    font?: {
        name?: string;
        sz?: number;
        bold?: boolean;
        italic?: boolean;
        color?: { rgb: string };
    };
    fill?: {
        fgColor?: { rgb: string };
    };
    alignment?: {
        horizontal?: string;
        vertical?: string;
    };
    border?: {
        top?: { style: string; color: { rgb: string } };
        right?: { style: string; color: { rgb: string } };
        bottom?: { style: string; color: { rgb: string } };
        left?: { style: string; color: { rgb: string } };
    };
}

const getColorForPersonCell = (cellValue: PersonName): string => {
    switch (cellValue) {
        case PersonName.NAJMA:
        case PersonName.EMILIA:
        case PersonName.ZULEIMA:
            return '073762';
        case PersonName.VICTOR:
        case PersonName.CHRIS:
            return 'B45E05';
        case PersonName.JEAN:
        case PersonName.AL:
        case PersonName.ALANA:
        case PersonName.DYLAN:
            return '124E5C';
        default:
            return '000000';
    }
};

const addColor = (style: Record<any, any>, color: Record<'text' | 'fill', string>): void => {
    style.font = {
        ...(style.font || {}),
        color: { rgb: color.text },
    };
    style.fill = {
        fgColor: { rgb: color.fill },
    };
};

const convertToAlternateRowCellStyle = (
    style: Record<any, any>,
    color: Record<'text' | 'fill', string>,
    convert: boolean,
) => {
    if (!convert) return style;

    return {
        ...style,
        font: {
            ...style.font,
            color: { rgb: color.text },
        },
        fill: {
            fgColor: { rgb: color.fill },
        },
    };
};

export const applyStylingToWorksheet = (worksheet: WorkSheet, columnIdMap: Record<SubHeaderKey, number>) => {
    const reversedColumnIdMap: Record<number, SubHeaderKey> = getReverseColumnIdMap(columnIdMap);

    const colors = {
        header: {
            text: 'B61F13',
            fill: 'FABC04',
        },
        wmTarget: {
            text: 'FFFFFF',
            fill: '15803d',
        },
        subHeader: {
            text: '000000',
            fill: 'FFAC03',
        },
        personName: {
            text: 'FFFFFF',
            fill: '073762',
        },
        personRow: {
            text: 'FFFFFF',
            fill: '0369a1',
        },
        default: {
            text: '000000',
            fill: 'D9D9D9',
        },
        alternateRow: {
            text: '000000',
            fill: 'FFFFFF',
        },
        positive: {
            text: '15803d',
        },
        negative: {
            text: 'dc2626',
        },
    };

    const borderStyle = {
        style: 'thin',
        color: { rgb: '000000' },
    };

    const commonStyle = {
        font: {
            name: 'Arial',
            sz: 9,
            bold: true,
        },
        alignment: {
            horizontal: 'center',
            vertical: 'center',
        },
        border: {
            right: borderStyle,
            left: borderStyle,
        },
    };

    const headerCellStyle = {
        ...commonStyle,
        font: {
            ...commonStyle.font,
            sz: 12,
            italic: true,
            bold: true,
        },
        border: {
            ...commonStyle.border,
            top: borderStyle,
            bottom: borderStyle,
        },
    };

    const wmTargetCellStyle = {
        ...commonStyle,
        font: {
            ...commonStyle.font,
            sz: 10,
            italic: true,
            bold: true,
        },
        border: {
            ...commonStyle.border,
            top: borderStyle,
            bottom: borderStyle,
        },
    };

    const subHeaderCellStyle = {
        ...commonStyle,
        font: {
            ...commonStyle.font,
            sz: 10,
            italic: true,
            bold: true,
        },
        border: {
            ...commonStyle.border,
            top: borderStyle,
            bottom: borderStyle,
        },
    };

    const storeIdCellStyle = {
        ...commonStyle,
        font: {
            ...commonStyle.font,
            italic: true,
            bold: true,
        },
    };

    const personNameCellStyle = {
        ...commonStyle,
        font: {
            ...commonStyle.font,
            italic: true,
            bold: true,
        },
    };

    const personRowCellStyle = {
        ...commonStyle,
        font: {
            ...commonStyle.font,
            bold: true,
            italic: true,
        },
    };

    const defaultCellStyle = {
        ...commonStyle,
    };

    addColor(headerCellStyle, colors.header);
    addColor(wmTargetCellStyle, colors.wmTarget);
    addColor(subHeaderCellStyle, colors.subHeader);
    addColor(storeIdCellStyle, colors.default);
    addColor(personNameCellStyle, colors.personName);
    addColor(personRowCellStyle, colors.personRow);
    addColor(defaultCellStyle, colors.default);

    const worksheetRange = worksheet['!ref'];

    if (!worksheetRange) return;

    const [startCell, endCell] = worksheetRange.split(':');

    const startRow = parseInt(startCell.slice(1), 10);
    const endRow = parseInt(endCell.slice(1), 10);

    const startColLetter = startCell.match(/[A-Z]+/i)![0];
    const endColLetter = endCell.match(/[A-Z]+/i)![0];

    const startCol = getColumnIndexFromLetter(startColLetter);
    const endCol = getColumnIndexFromLetter(endColLetter);

    const headerRow = startRow;
    const wmTargetRow = startRow + 1;
    const subHeaderRow = startRow + 2;

    let i = 0;

    for (let row = startRow; row <= endRow; row++) {
        const isAlternateRow = i % 2 === 0;
        const isPersonRow = Object.values(PersonName).includes(worksheet[getColumnLetterFromIndex(startCol) + row]?.v);
        const isHeaderRow = row === headerRow;
        const isWmTargetRow = row === wmTargetRow;
        const isSubHeaderRow = row === subHeaderRow;

        let updateAlternateRow = false;

        for (let col = startCol; col <= endCol; col++) {
            const colKey = reversedColumnIdMap[col];

            const cellAddress = getColumnLetterFromIndex(col) + row;
            const cell = worksheet[cellAddress];
            const isPersonCell = isPersonRow && col === startCol;
            const wmTargetData = WmTargetsSubHeader[colKey];

            if (!cell) continue;

            if (isHeaderRow) {
                cell.s = headerCellStyle;
                continue;
            }

            if (isWmTargetRow) {
                cell.s = wmTargetCellStyle;
                continue;
            }

            if (isSubHeaderRow) {
                cell.s = subHeaderCellStyle;
                continue;
            }

            if (isPersonCell) {
                cell.s = {
                    ...personNameCellStyle,
                    fill: { fgColor: { rgb: getColorForPersonCell(cell.v) } },
                };

                continue;
            }

            if (isPersonRow) {
                cell.s = personRowCellStyle;
                continue;
            }

            if (col === startCol) {
                cell.s = convertToAlternateRowCellStyle(storeIdCellStyle, colors.alternateRow, isAlternateRow);
                updateAlternateRow = true;
                continue;
            }

            cell.s = convertToAlternateRowCellStyle(defaultCellStyle, colors.alternateRow, isAlternateRow);
            updateAlternateRow = true;

            /**
             *  Conditional formatting Based on target Metrics
             */
            if (!cell.v) continue;
            if (wmTargetData.value !== null || wmTargetData.targetColumnKey) {
                const cellValue = getParsedValue(cell.v);

                let targetCell = null;
                let targetValue: string | number | null = wmTargetData.value;

                if (wmTargetData.targetColumnKey) {
                    targetCell = worksheet[getColumnLetterFromIndex(columnIdMap[wmTargetData.targetColumnKey]) + row];
                    targetValue = getParsedValue(targetCell?.v);

                    if (!targetValue) continue;
                }

                if (typeof cellValue !== 'number') {
                    if (!isStars(cellValue))
                        console.error(
                            `Invalid cell value for wmTargetValue: Parsed Cell Value: ${cellValue} --- Original Cell Value: ${cell.v}`,
                        );

                    continue;
                }

                if (typeof targetValue !== 'number') {
                    console.error(
                        `Invalid target value for wmTargetValue: Parsed Target Value: ${targetValue} --- Original Target Value: ${targetCell.value}`,
                    );

                    continue;
                }

                const isPositive =
                    wmTargetData.optimalDirection === OptimalDirection.UP
                        ? cellValue >= targetValue
                        : cellValue <= targetValue;

                cell.s = {
                    ...cell.s,
                    font: {
                        ...cell.s.font,
                        color: { rgb: isPositive ? colors.positive.text : colors.negative.text },
                        bold: true,
                    },
                };
            }
        }

        if (updateAlternateRow) {
            i++;
        }
    }

    worksheet['!cols'] = Array.from({ length: endCol + 1 }, () => ({ wch: 14 })).map((col, index) => {
        const cellAddress = getColumnLetterFromIndex(index) + subHeaderRow;
        const cell = worksheet[cellAddress];

        if (cell) {
            const cellValue = cell.v || '';
            const maxLength = Math.max(cellValue.toString().length + 4, 14);
            return { ...col, wch: maxLength };
        }

        return col;
    });

    worksheet['!rows'] = [
        { hpt: 22 }, // Header row height
        { hpt: 18 }, // WmTarget row height
        { hpt: 18 }, // Sub-header row height
    ];
};

const getValueFormat = (value: any, colKey: SubHeaderKey, isHeaderRow: boolean): string => {
    const numFormat = '0';
    let decFormat = '0.00';
    const percentFormat = '0.00%';
    const defaultFormat = '@';

    if (isHeaderRow) return defaultFormat;

    if (colKey === SubHeaderKey.DELIVERY__PLUS_MINUS || colKey === SubHeaderKey.DIGITAL_APP__PLUS_MINUS) {
        decFormat = '0.0';
    }

    if (typeof value === 'number') {
        return value % 1 === 0 ? numFormat : decFormat;
    }

    if (typeof value === 'string') {
        if (isNumericOrPercentage(value)) {
            return value.endsWith('%') ? percentFormat : value.includes('.') ? decFormat : numFormat;
        }
    }

    return defaultFormat;
};

const getParsedValue = (value: any, isHeaderRow?: boolean): number | string => {
    if (value === null || value === undefined) {
        return '';
    }

    if (isHeaderRow) {
        return typeof value === 'string' ? value.trim() : value;
    }

    if (typeof value === 'number') {
        return value;
    }

    if (typeof value === 'string') {
        if (isNumericOrPercentage(value)) {
            return +(value.endsWith('%') ? parseFloat(value) / 100 : parseFloat(value)).toFixed(4);
        }
        return value.trim();
    }

    return value;
};

const convertXlsxWorkbookToExcelJsWorkbookWithStyles = (
    workbook: WorkBook,
    columnIdMap: Record<SubHeaderKey, number>,
    numHeaderRows: number,
): ExcelJs.Workbook => {
    const reversedColumnIdMap: Record<number, SubHeaderKey> = getReverseColumnIdMap(columnIdMap);

    const excelJsWorkbook = new ExcelJs.Workbook();

    const sheetNames = workbook.SheetNames;

    for (const sheetName of sheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const excelJsWorksheet = excelJsWorkbook.addWorksheet(sheetName);

        const range = worksheet['!ref'];
        if (!range) continue;

        const [startCell, endCell] = range.split(':');
        const startRow = parseInt(startCell.slice(1), 10);
        const endRow = parseInt(endCell.slice(1), 10);

        const startColLetter = startCell.match(/[A-Z]+/i)![0];
        const endColLetter = endCell.match(/[A-Z]+/i)![0];

        const startCol = getColumnIndexFromLetter(startColLetter);
        const endCol = getColumnIndexFromLetter(endColLetter);

        for (let row = startRow; row <= endRow; row++) {
            const isHeaderRow = row < startRow + numHeaderRows;

            for (let col = startCol; col <= endCol; col++) {
                const colKey = reversedColumnIdMap[col];

                const cellAddress = getColumnLetterFromIndex(col) + row;
                const cell = worksheet[cellAddress];

                if (cell) {
                    excelJsWorksheet.getCell(cellAddress).value = getParsedValue(cell.v, isHeaderRow);
                    if (cell.s) {
                        const { fill, font, alignment, border } = cell.s as XlsxCellStyle;
                        excelJsWorksheet.getCell(cellAddress).style = {
                            fill: fill?.fgColor?.rgb
                                ? {
                                      type: 'pattern',
                                      pattern: 'solid',
                                      fgColor: { argb: fill.fgColor.rgb },
                                  }
                                : undefined,
                            font: font
                                ? {
                                      name: font.name,
                                      size: font.sz,
                                      bold: font.bold,
                                      italic: font.italic,
                                      color: { argb: font.color?.rgb },
                                  }
                                : undefined,
                            alignment: alignment
                                ? ({
                                      horizontal: alignment.horizontal,
                                      vertical: alignment.vertical === 'center' ? 'middle' : alignment.vertical,
                                  } as ExcelJs.Alignment)
                                : undefined,
                            border: border
                                ? ({
                                      top: border.top
                                          ? {
                                                style: border.top.style,
                                                color: { argb: border.top.color.rgb },
                                            }
                                          : undefined,
                                      right: border.right
                                          ? {
                                                style: border.right.style,
                                                color: { argb: border.right.color.rgb },
                                            }
                                          : undefined,
                                      bottom: border.bottom
                                          ? {
                                                style: border.bottom.style,
                                                color: { argb: border.bottom.color.rgb },
                                            }
                                          : undefined,
                                      left: border.left
                                          ? {
                                                style: border.left.style,
                                                color: { argb: border.left.color.rgb },
                                            }
                                          : undefined,
                                  } as ExcelJs.Borders)
                                : undefined,
                        };
                    }

                    excelJsWorksheet.getCell(cellAddress).numFmt = getValueFormat(cell.v, colKey, isHeaderRow);
                }
            }
        }

        // Set column widths
        const cols = worksheet['!cols'] || [];
        for (let col = startCol; col <= endCol; col++) {
            const colWidth = (cols[col - startCol]?.wch || 14) * 1.06; // Default width if not specified
            excelJsWorksheet.getColumn(col + 1).width = colWidth;
        }
        // Set row heights
        const rows = worksheet['!rows'] || [];
        for (let row = startRow; row <= endRow; row++) {
            const rowHeight = rows[row - startRow]?.hpt || 15; // Default height if not specified
            excelJsWorksheet.getRow(row).height = rowHeight;
        }

        // Copy merged cells
        const mergedCells = worksheet['!merges'] || [];
        for (const merge of mergedCells) {
            const start = merge.s;
            const end = merge.e;
            excelJsWorksheet.mergeCells(start.r + 1, start.c + 1, end.r + 1, end.c + 1);
        }
    }

    return excelJsWorkbook;
};

function insertRowsAtTopWithMergeShift(worksheet: ExcelJs.Worksheet, rowCount: number) {
    worksheet.spliceRows(1, 0, ...Array(rowCount).fill([]));

    const merges = worksheet.model.merges;

    for (const merge of merges) {
        const [startAddr, endAddr] = merge.split(':');
        const startRow = parseInt(startAddr.slice(1), 10) + rowCount;
        const endRow = parseInt(endAddr.slice(1), 10) + rowCount;

        worksheet.getCell(startAddr).unmerge();
        worksheet.getCell(endAddr).unmerge();
        worksheet.unMergeCells(merge);

        const newMerge = `${startAddr[0]}${startRow}:${endAddr[0]}${endRow}`;

        worksheet.mergeCells(newMerge);
    }
}

export const applyBannerStylingToWorkbook = async (
    xlsxWorkbook: WorkBook,
    columnIdMap: Record<SubHeaderKey, number>,
    numHeaderRows: number,
    reportDateRange: string,
): Promise<ExcelJs.Workbook | null> => {
    const logo1Path = '/images/mc-logo-branch-white.png';
    const logo2Path = '/images/mc-logo.png';

    const logo1CellColor = '282828';
    const logo2CellColor = 'c20d00';

    const text1 = 'ALL RESTAURANTS - WM MTD DASHBOARD';
    const text2 = 'WASHINGTON DC BALTIMORE EASTERN SHORE-BWE';
    const dateText = `Date:     ${reportDateRange}`;

    const workbook = convertXlsxWorkbookToExcelJsWorkbookWithStyles(xlsxWorkbook, columnIdMap, numHeaderRows);

    const worksheet = workbook.getWorksheet(1);

    if (!worksheet) {
        console.error('Worksheet not found');
        return null;
    }

    const minColumnCountForBanner = 8; // Minimum columns required for banner styling

    const filledColumnCount = worksheet.columnCount || 0;
    const extraColumnsNeeded = minColumnCountForBanner - filledColumnCount;

    const columnCount = filledColumnCount < minColumnCountForBanner ? minColumnCountForBanner : filledColumnCount;

    if (extraColumnsNeeded > 0) {
        for (let i = 1; i <= extraColumnsNeeded; i++) {
            worksheet.getColumn(filledColumnCount + i).width = 14 * 1.06;
        }
    }

    const columnRange = `${worksheet.getColumn(1).letter}1:${worksheet.getColumn(columnCount).letter}1`;

    const logo1Buffer = await (await fetch(logo1Path)).arrayBuffer();
    const logo2Buffer = await (await fetch(logo2Path)).arrayBuffer();

    const logo1Image = workbook.addImage({
        buffer: logo1Buffer,
        extension: 'png',
    });

    const logo2Image = workbook.addImage({
        buffer: logo2Buffer,
        extension: 'png',
    });

    // insert empty rows at the top for logos
    insertRowsAtTopWithMergeShift(worksheet, 4);

    worksheet.mergeCells(columnRange);
    worksheet.mergeCells('A2:A3');
    worksheet.mergeCells('B2:E2');
    worksheet.mergeCells('B3:E3');
    worksheet.mergeCells(3, columnCount - 2, 3, columnCount);

    worksheet.getRow(1).height = 54;
    worksheet.getRow(2).height = 24;
    worksheet.getRow(3).height = 24;

    const logo1Cell = worksheet.getCell('A1');
    const dateCell = worksheet.getCell(3, columnCount - 2);
    const text1Cell = worksheet.getCell('B2');
    const text2Cell = worksheet.getCell('B3');

    text1Cell.value = text1;
    text2Cell.value = text2;
    dateCell.value = dateText;

    worksheet.addImage(logo1Image, {
        ext: { width: 125, height: 50 },
        tl: { col: 0.5, row: 0.2 },
        editAs: 'oneCell',
    });

    worksheet.addImage(logo2Image, {
        ext: { width: 45, height: 45 },
        tl: { col: 0.5, row: 1.4 },
        editAs: 'oneCell',
    });

    logo1Cell.style = {
        fill: {
            pattern: 'solid',
            type: 'pattern',
            fgColor: { argb: logo1CellColor },
        },
    };

    text1Cell.style = {
        font: {
            name: 'Arial',
            size: 12,
            bold: true,
            color: { argb: 'FFFFFF' },
        },
        alignment: {
            vertical: 'middle',
        },
    };

    text2Cell.style = {
        font: {
            name: 'Arial',
            size: 10,
            bold: true,
            italic: true,
            color: { argb: 'FFFFFF' },
        },
        alignment: {
            vertical: 'top',
        },
    };

    dateCell.style = {
        font: {
            name: 'Arial',
            size: 10,
            bold: true,
            color: { argb: 'FFFFFF' },
        },
        alignment: {
            vertical: 'top',
        },
    };

    for (let i = 1; i <= columnCount; i++) {
        const cell1 = worksheet.getCell(2, i);
        const cell2 = worksheet.getCell(3, i);
        cell1.style.fill = {
            pattern: 'solid',
            type: 'pattern',
            fgColor: { argb: logo2CellColor },
        };

        cell2.style.fill = {
            pattern: 'solid',
            type: 'pattern',
            fgColor: { argb: logo2CellColor },
        };
    }

    return workbook;
};
