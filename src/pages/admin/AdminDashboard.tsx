import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import { getWasteTypeLabel } from "@/utils/pointsCalculator";
import { format } from "date-fns";
import { VerifySubmissionDialog } from "@/components/VerifySubmissionDialog";
import { Navigate } from "react-router-dom";
import { tablesDB } from "@/integrations/supabase/client";
import { Query } from "appwrite";
import { useUserRole } from "@/hooks/useUserRole";
export default function AdminDashboard() {
  const { user } = useAuth();
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  useEffect(() => {
    if (!roleLoading && isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const fetchAdminData = async () => {
    try {
      // Fetch all submissions for stats
      const { rows: allSubmissions } = await tablesDB.listRows({
        databaseId: "68b425c600306430be1c",
        tableId: "submissions",
        queries: [Query.select(["verification_status"])],
        total: false,
      });

      const stats = {
        total: allSubmissions?.length || 0,
        pending:
          allSubmissions?.filter((s) => s.verification_status === "pending")
            .length || 0,
        verified:
          allSubmissions?.filter((s) => s.verification_status === "verified")
            .length || 0,
        rejected:
          allSubmissions?.filter((s) => s.verification_status === "rejected")
            .length || 0,
      };
      setStats(stats);

      // Fetch pending submissions with user details
      const { rows: pending } = await tablesDB.listRows({
        databaseId: "68b425c600306430be1c",
        tableId: "submissions",
        queries: [
          Query.equal("verification_status", "pending"),
          Query.notEqual("user_id", user.$id),
          Query.orderDesc("$createdAt"),
        ],
      });
      setPendingSubmissions(pending || []);
    } catch (error: any) {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 container px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Review and verify e-waste submissions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Submissions
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-500">
                {stats.pending}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {stats.verified}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">
                {stats.rejected}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verification Queue */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Queue</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingSubmissions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pending submissions to review</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>College ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Bin</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingSubmissions.map((submission) => (
                      <TableRow key={submission.$id}>
                        <TableCell>
                          {format(
                            new Date(submission.$createdAt),
                            "MMM dd, yyyy",
                          )}
                        </TableCell>
                        <TableCell>{submission.user_name}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {submission?.college_id}
                        </TableCell>
                        <TableCell>
                          {getWasteTypeLabel(submission.waste_type)}
                        </TableCell>
                        <TableCell>
                          {submission.quantity} {submission.unit}
                        </TableCell>
                        <TableCell>{submission.bin || "N/A"}</TableCell>
                        <TableCell className="font-semibold">
                          {submission.points_earned}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedSubmission(submission)}
                          >
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />

      {selectedSubmission && (
        <VerifySubmissionDialog
          submission={selectedSubmission}
          open={!!selectedSubmission}
          onOpenChange={(open) => !open && setSelectedSubmission(null)}
          onSuccess={fetchAdminData}
        />
      )}
    </div>
  );
}
