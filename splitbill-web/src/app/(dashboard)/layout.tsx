import AuthGuard from "@/features/auth/components/AuthGuard";
import Navbar from "@/components/layout/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-brand-cream font-sans relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-red/10 blur-[120px] animate-float"></div>
          <div
            className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] rounded-full bg-brand-taupe/40 blur-[100px] animate-float"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <Navbar />

        {children}
      </div>
    </AuthGuard>
  );
}
