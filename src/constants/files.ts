import { SubHeaderKey } from '.';
import { createMergedHeader } from '@/utils';

export enum FileKey {
    QSR_SALES = 'QSR_SALES',
    QSR_SERVICE = 'QSR_SERVICE',
    QSR_LABOR = 'QSR_LABOR',
    QSR_DELIVERY = 'QSR_DELIVERY',
    QSR_DIGITAL_APP = 'QSR_DIGITAL_APP',
    QSR_FOOD_COST = 'QSR_FOOD_COST',
    VOICE = 'VOICE',
    DOORDASH = 'DOORDASH',
    NORM = 'NORM',
    BENCHMARK = 'BENCHMARK',
}

export const FileToStoreIdMap = {
    [FileKey.QSR_SALES]: 'Loc',
    [FileKey.QSR_SERVICE]: 'Loc',
    [FileKey.QSR_LABOR]: 'Loc',
    [FileKey.QSR_DELIVERY]: 'Loc',
    [FileKey.QSR_DIGITAL_APP]: 'Loc',
    [FileKey.QSR_FOOD_COST]: 'Loc',
    [FileKey.VOICE]: 'Restaurant',
    [FileKey.DOORDASH]: 'Merchant Supplied ID',
    [FileKey.NORM]: 'Store',
    [FileKey.BENCHMARK]: createMergedHeader('P&L Benchmarking', 'Store'),
};

export const FileConfig = {
    [FileKey.QSR_SALES]: { superHeaderRow: null, headerRow: 0 },
    [FileKey.QSR_SERVICE]: { superHeaderRow: null, headerRow: 0 },
    [FileKey.QSR_LABOR]: { superHeaderRow: null, headerRow: 0 },
    [FileKey.QSR_DELIVERY]: { superHeaderRow: null, headerRow: 0 },
    [FileKey.QSR_DIGITAL_APP]: { superHeaderRow: null, headerRow: 0 },
    [FileKey.QSR_FOOD_COST]: { superHeaderRow: null, headerRow: 0 },
    [FileKey.VOICE]: { superHeaderRow: null, headerRow: 2 }, // 0 based index
    [FileKey.DOORDASH]: { superHeaderRow: null, headerRow: 0 },
    [FileKey.NORM]: { superHeaderRow: null, headerRow: 1 },
    [FileKey.BENCHMARK]: { superHeaderRow: 2, headerRow: 3 },
};

export const ColumnsPerFileKeyMap = {
    [FileKey.QSR_SALES]: [SubHeaderKey.SALES__GUEST_COUNTS, SubHeaderKey.SALES__SALES],
    [FileKey.QSR_SERVICE]: [SubHeaderKey.SERVICE__OEPE, SubHeaderKey.SERVICE__KVS],
    [FileKey.QSR_LABOR]: [SubHeaderKey.LABOR__CREW_LABOR],
    [FileKey.QSR_DELIVERY]: [SubHeaderKey.DELIVERY__GC, SubHeaderKey.DELIVERY__PLUS_MINUS],
    [FileKey.QSR_DIGITAL_APP]: [SubHeaderKey.DIGITAL_APP__GC, SubHeaderKey.DIGITAL_APP__PLUS_MINUS],
    [FileKey.DOORDASH]: [SubHeaderKey.DOORDASH__ADWT, SubHeaderKey.DOORDASH__ACCURACY],
    [FileKey.QSR_FOOD_COST]: [SubHeaderKey.FOOD_COST__P_AND_L_FOOD_COST, SubHeaderKey.FOOD_COST__FOOD_OVER_BASE_FOB],
    [FileKey.VOICE]: [
        SubHeaderKey.VOICE__OVERALL,
        SubHeaderKey.VOICE__OVERALL_B2B,
        SubHeaderKey.VOICE__ACCURACY,
        SubHeaderKey.VOICE__FRIENDLY,
    ],
    [FileKey.NORM]: [
        SubHeaderKey.FOOD_COST__FOOD_NORM,
        SubHeaderKey.FOOD_COST__FOB_NORM,
        SubHeaderKey.LABOR__LABOR_NORM,
    ],
    [FileKey.BENCHMARK]: [SubHeaderKey.FOOD_COST__FOOD_OPPURTUNITY, SubHeaderKey.LABOR__LABOR_OPPURTUNITY],
};

export const DependencyInputHeaderNamesPerFile: Record<string, Record<string, Record<string, string>>> = {
    [FileKey.BENCHMARK]: {
        [SubHeaderKey.FOOD_COST__FOOD_OPPURTUNITY]: {
            OPP_PERCENT: createMergedHeader('Food', '% Opp'),
            OPP_DOLLAR: createMergedHeader('Food', '$ Opp'),
        },
        [SubHeaderKey.LABOR__LABOR_OPPURTUNITY]: {
            OPP_PERCENT: createMergedHeader('Labor', '% Opp'),
            OPP_DOLLAR: createMergedHeader('Labor', '$ Opp'),
        },
    },
};
