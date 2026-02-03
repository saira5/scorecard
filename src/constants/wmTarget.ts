import { SubHeaderKey } from '.';

export enum OptimalDirection {
    UP = 'up',
    DOWN = 'down',
}

export const WmTargetsSubHeader = {
    [SubHeaderKey.SALES__STORES]: {
        text: 'WM TARGET',
        value: null,
        optimalDirection: null,
        targetColumnKey: null,
    },
    [SubHeaderKey.SALES__GUEST_COUNTS]: {
        text: '3%',
        value: 0.03,
        optimalDirection: OptimalDirection.UP,
        targetColumnKey: null,
    },
    [SubHeaderKey.SALES__SALES]: {
        text: '6%',
        value: 0.06,
        optimalDirection: OptimalDirection.UP,
        targetColumnKey: null,
    },
    [SubHeaderKey.VOICE__OVERALL]: {
        text: '75%',
        value: 0.75,
        optimalDirection: OptimalDirection.UP,
        targetColumnKey: null,
    },
    [SubHeaderKey.VOICE__OVERALL_B2B]: {
        text: '5%',
        value: 0.05,
        optimalDirection: OptimalDirection.DOWN,
        targetColumnKey: null,
    },
    [SubHeaderKey.VOICE__ACCURACY]: {
        text: '88%',
        value: 0.88,
        optimalDirection: OptimalDirection.UP,
        targetColumnKey: null,
    },
    [SubHeaderKey.VOICE__FRIENDLY]: {
        text: '88%',
        value: 0.88,
        optimalDirection: OptimalDirection.UP,
        targetColumnKey: null,
    },
    [SubHeaderKey.SERVICE__OEPE]: {
        text: '120 sec',
        value: 120,
        optimalDirection: OptimalDirection.DOWN,
        targetColumnKey: null,
    },
    [SubHeaderKey.SERVICE__KVS]: {
        text: '50 sec',
        value: 50,
        optimalDirection: OptimalDirection.DOWN,
        targetColumnKey: null,
    },
    [SubHeaderKey.DOORDASH__ACCURACY]: {
        text: '3%',
        value: 3,
        optimalDirection: OptimalDirection.DOWN,
        targetColumnKey: null,
    },
    [SubHeaderKey.DOORDASH__ADWT]: {
        text: '3.8 min',
        value: 3.8,
        optimalDirection: OptimalDirection.DOWN,
        targetColumnKey: null,
    },
    [SubHeaderKey.DIGITAL_APP__GC]: {
        text: '',
        value: null,
        optimalDirection: null,
        targetColumnKey: null,
    },
    [SubHeaderKey.DIGITAL_APP__PLUS_MINUS]: {
        text: 'Plus 70',
        value: 70,
        optimalDirection: OptimalDirection.UP,
        targetColumnKey: null,
    },
    [SubHeaderKey.DELIVERY__GC]: {
        text: '',
        value: null,
        optimalDirection: null,
        targetColumnKey: null,
    },
    [SubHeaderKey.DELIVERY__PLUS_MINUS]: {
        text: 'Plus 10',
        value: 10,
        optimalDirection: OptimalDirection.UP,
        targetColumnKey: null,
    },
    [SubHeaderKey.FOOD_COST__P_AND_L_FOOD_COST]: {
        text: '',
        value: null,
        optimalDirection: OptimalDirection.DOWN,
        targetColumnKey: SubHeaderKey.FOOD_COST__FOOD_NORM,
    },
    [SubHeaderKey.FOOD_COST__FOOD_NORM]: {
        text: '',
        value: null,
        optimalDirection: null,
        targetColumnKey: null,
    },
    [SubHeaderKey.FOOD_COST__FOOD_OPPURTUNITY]: {
        text: '',
        value: null,
        optimalDirection: null,
        targetColumnKey: null,
    },
    [SubHeaderKey.FOOD_COST__FOOD_OVER_BASE_FOB]: {
        text: '',
        value: null,
        optimalDirection: OptimalDirection.DOWN,
        targetColumnKey: SubHeaderKey.FOOD_COST__FOB_NORM,
    },
    [SubHeaderKey.FOOD_COST__FOB_NORM]: {
        text: '',
        value: null,
        optimalDirection: null,
        targetColumnKey: null,
    },
    [SubHeaderKey.LABOR__CREW_LABOR]: {
        text: '',
        value: null,
        optimalDirection: OptimalDirection.DOWN,
        targetColumnKey: SubHeaderKey.LABOR__LABOR_NORM,
    },
    [SubHeaderKey.LABOR__LABOR_NORM]: {
        text: '',
        value: null,
        optimalDirection: null,
        targetColumnKey: null,
    },
    [SubHeaderKey.LABOR__LABOR_OPPURTUNITY]: {
        text: '',
        value: null,
        optimalDirection: null,
        targetColumnKey: null,
    },
    [SubHeaderKey.RHMC__DONATIONS]: {
        text: '',
        value: null,
        optimalDirection: null,
        targetColumnKey: null,
    },
};
