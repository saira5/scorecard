import { TriangleAlert, X } from 'lucide-react';

export default function ErrorMessage({ error, closeFn }: { error: string; closeFn: () => void }) {
    return (
        error && (
            <div
                className="flex w-full items-center p-4 mb-4 gap-2 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
                role="alert"
            >
                <TriangleAlert className="h-4 w-4 text-red-500" />
                <span className="sr-only">Error</span>
                <div>{error}</div>
                <button
                    type="button"
                    className="inline-flex items-center p-1.5 ml-auto text-sm text-red-400 rounded-lg hover:bg-red-100 hover:text-red-900 dark:hover:bg-gray-800 dark:hover:text-red-500 cursor-pointer"
                    onClick={() => closeFn()}
                    aria-label="Close"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        )
    );
}
