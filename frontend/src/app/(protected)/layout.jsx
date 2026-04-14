import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function ProtectedLayout({ children }) {
  return (
    <AuthGuard>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
    </AuthGuard>
  );
}
