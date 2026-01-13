import ReportsPageClient from './client';
import { getReports } from '@/actions/report';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
    const reportsResponse = await getReports();

    let reports = reportsResponse.reports || [];

    if (reportsResponse.error) {
        console.error('Error fetching reports:', reportsResponse.error);
        reports = [];
    }

    return <ReportsPageClient initialReports={reports} />;
}
