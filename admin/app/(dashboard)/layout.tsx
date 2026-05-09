import { Sidebar } from "@/components/admin/sidebar";
import { AuthGuard } from "@/components/admin/auth-guard";
import { AIAssistantWidget } from "@/components/admin/ai-assistant-widget";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col">{children}</div>
        <AIAssistantWidget />
      </div>
    </AuthGuard>
  );
}
