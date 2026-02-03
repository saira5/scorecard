export const getBaseUrl = () => {
    if (process.env.NEXT_APP_URL) {
        return process.env.NEXT_APP_URL;
    }

    if (process.env.NODE_ENV === 'development') {
        return `http://localhost:${process.env.PORT ?? 3000}`;
    }

    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
        return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    }

    throw new Error('No base URL found');
};

export const getLocalDate = () => {
    const date = new Date();
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().split('T')[0];
};

export const generateReportFileName = (reportNumber: number, startDate: string, endDate: string) => {
    return `Scorecard_${startDate}_to_${endDate}.xlsx`;
};

export function getColumnLetterFromIndex(index: number): string {
    let letter = '';
    index += 1;
    while (index > 0) {
        const mod = (index - 1) % 26;
        letter = String.fromCharCode(65 + mod) + letter;
        index = Math.floor((index - 1) / 26);
    }
    return letter;
}

export function getColumnIndexFromLetter(letter: string): number {
    let index = 0;
    for (let i = 0; i < letter.length; i++) {
        const charCode = letter.charCodeAt(i) - 64;
        index = index * 26 + charCode;
    }
    return index - 1;
}

export function createMergedHeader(superHeader: string | null, header: string): string {
    return (superHeader ? `(${superHeader}) ${header}` : header).trim();
}

export function isNumericOrPercentage(value: string): boolean {
    return /^-?\d+(\.\d+)?%?$/.test(value);
}

export function isStars(value: string): boolean {
    return /^\*+$/.test(value);
}
