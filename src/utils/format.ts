import { OrderedHeadersAndSubHeaders, SubHeaderKey, SubHeaderNames } from '@/constants';
import { OrderedStores } from '@/constants/stores';
import { WmTargetsSubHeader } from '@/constants/wmTarget';

export interface TableFormatWithRowColumnMap {
    table: string[][];
    rowIdMap: Record<string, number>;
    columnIdMap: Record<SubHeaderKey, number>;
    numColumns: number;
    numRows: number;
    numHeaderRows: number;
}

export const getTableFormatWithRowColumnMap = (
    unselectedKnownColumnKeys: SubHeaderKey[],
): TableFormatWithRowColumnMap => {
    const header: string[] = [];
    const subHeader: string[] = [];
    const wmTargetHeader: string[] = [];

    const subHeaderKeysOrdered: SubHeaderKey[] = [];

    OrderedHeadersAndSubHeaders.forEach(({ mainHeader, subHeaderKeys }) => {
        const subHeaderKeysFiltered = subHeaderKeys.filter((key) => !unselectedKnownColumnKeys.includes(key));

        if (subHeaderKeysFiltered.length === 0) return;

        header.push(...Array(subHeaderKeysFiltered.length).fill(mainHeader));
        subHeaderKeysOrdered.push(...subHeaderKeysFiltered);
    });

    const numColumns = subHeaderKeysOrdered.length;

    const rowIdMap: Record<string | number, number> = {};
    const columnIdMap: Record<string, number> = {};

    for (let i = 0; i < subHeaderKeysOrdered.length; i++) {
        const key = subHeaderKeysOrdered[i];
        subHeader.push(SubHeaderNames[key]);
        wmTargetHeader.push(WmTargetsSubHeader[key].text);
        columnIdMap[key] = i;
    }

    const headerRows: string[][] = [header, wmTargetHeader, subHeader];

    const table: string[][] = [...headerRows];

    OrderedStores.forEach((store, index) => {
        rowIdMap[store] = index + headerRows.length;
        const row = Array(numColumns).fill('');
        row[0] = store;
        table.push(row);
    });

    return {
        table,
        rowIdMap,
        columnIdMap,
        numColumns,
        numRows: table.length,
        numHeaderRows: headerRows.length,
    };
};

export const getReverseColumnIdMap = (columnIdMap: Record<SubHeaderKey, number>): Record<number, SubHeaderKey> => {
    return Object.fromEntries(Object.entries(columnIdMap).map(([key, value]) => [value, key])) as Record<
        number,
        SubHeaderKey
    >;
};
