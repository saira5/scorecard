export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
            <div className="flex flex-col items-center space-y-4 animate-fadeIn">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <h1 className="text-2xl font-semibold text-gray-800">Loading...</h1>
                <p className="text-sm text-gray-500">Please wait while we prepare things for you.</p>
            </div>
        </div>
    );
}
