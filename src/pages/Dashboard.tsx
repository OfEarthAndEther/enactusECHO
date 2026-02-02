import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, FileText, CheckCircle, Plus, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { SubmitWasteDialog } from "@/components/SubmitWasteDialog";
import { getWasteTypeLabel } from "@/utils/pointsCalculator";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import { format } from "date-fns";
import { tablesDB } from "@/integrations/supabase/client";
import { Query } from "appwrite";

export default function Dashboard() {
  const { user, loading: contextLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);
  const fetchDashboardData = async () => {
    try {
      // Fetch profile
      const profileData = await tablesDB.getRow({
        databaseId: "68b425c600306430be1c",
        tableId: "profiles",
        rowId: user.$id,
      });
      setProfile(profileData);

      // Fetch submissions
      const { rows: submissionsData } = await tablesDB.listRows({
        databaseId: "68b425c600306430be1c",
        tableId: "submissions",
        queries: [
          Query.orderDesc("$createdAt"),
          Query.equal("user_id", user.$id),
        ],
        total: false,
      });
      setSubmissions(submissionsData || []);
    } catch (error: any) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const csvData = submissions.map((sub) => ({
      Date: format(new Date(sub.created_at), "MMM dd, yyyy"),
      "Waste Type": getWasteTypeLabel(sub.waste_type),
      Quantity: `${sub.quantity} ${sub.unit}`,
      "Bin Location": sub.bins?.name || "N/A",
      "Bag Number": sub.bag_number || "N/A",
      Points: sub.points_earned,
      Status: sub.verification_status,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `echo-submissions-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    toast.success("CSV downloaded successfully");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      verified: "default",
      pending: "secondary",
      rejected: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const verifiedCount = submissions.filter(
    (s) => s.verification_status === "verified",
  ).length;

  if (loading || contextLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 container px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {profile?.full_name}!
          </h1>
          <p className="text-muted-foreground">
            Track your environmental impact and submissions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Points
              </CardTitle>
              <Trophy className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-row justify-between">
                <p className="text-3xl font-bold text-primary">
                  {profile?.points_total || 0}
                </p>
                <Button
                  onClick={() => navigate("/vouchers")}
                  className="bg-gradient-to-r from-primary to-primary-light"
                >
                  Redeem
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Keep contributing!
              </p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Submissions
              </CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{submissions.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                E-waste items submitted
              </p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <CheckCircle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{verifiedCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Approved submissions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Button
            onClick={() => setSubmitDialogOpen(true)}
            className="bg-gradient-to-r from-primary to-primary-light"
          >
            <Plus className="mr-2 h-4 w-4" />
            Submit New E-Waste
          </Button>
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={submissions.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Submissions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No submissions yet. Start contributing to earn points!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableBody>
                    <ScrollArea
                      type="always"
                      style={
                        submissions.length > 4
                          ? { height: "40vh" }
                          : { height: "15vh" }
                      }
                    >
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Bin</TableHead>
                        <TableHead>Points</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                      {submissions.map((submission) => (
                        <TableRow key={submission.$id}>
                          <TableCell>
                            {format(
                              new Date(submission.$createdAt),
                              "MMM dd, yyyy",
                            )}
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
                            {getStatusBadge(submission.verification_status)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </ScrollArea>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />

      <SubmitWasteDialog
        open={submitDialogOpen}
        onOpenChange={setSubmitDialogOpen}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
}
