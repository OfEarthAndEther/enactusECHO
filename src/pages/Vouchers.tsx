import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { RedeemVoucherDialog } from "@/components/RedeemVoucher";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText } from "lucide-react";
export default function Vouchers() {
  const { user } = useAuth();
  const [vouchers, setVouchers] = useState([]);
  const [userVoucher, setUserVouchers] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voucherDialog, setVoucherDialog] = useState(null);

  useEffect(() => {
    fetchVouchers();
  }, [user]);

  const fetchVouchers = async () => {
    if (!user) return;

    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      const { data: voucherRows, error: voucherError } = await supabase
        .from("vouchers")
        .select("*");

      if (voucherError) throw voucherError;
      setVouchers(voucherRows);

      const { data: reedemed, error: redeemedError } = await supabase
        .from("redeemed")
        .select("*")
        .eq("user_id", user.id);

      if (redeemedError) throw redeemedError;
      setUserVouchers(reedemed);
    } catch (error: any) {
      toast.error("Failed to fetch vouchers");
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
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 container px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {profile?.full_name}!
          </h1>
          <p className="text-muted-foreground">Redeem your vouchers here</p>
        </div>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex flex-row justify-between">
              <p>Available Vouchers</p>
              <p className="">
                Your points:{" "}
                <div className="text-primary inline">
                  {profile.points_total}
                </div>
              </p>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {vouchers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No vouchers available yet. Coming soon!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableBody>
                    <ScrollArea
                      type="always"
                      style={
                        vouchers.length > 4
                          ? { height: "40vh" }
                          : { height: "15vh" }
                      }
                    >
                      <TableRow>
                        <TableHead>Voucher Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead />
                      </TableRow>
                      {vouchers.map((voucher) => (
                        <TableRow key={voucher.id}>
                          <TableCell>{voucher.name}</TableCell>
                          <TableCell>{voucher.description}</TableCell>
                          <TableCell>{voucher.quantity}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setVoucherDialog(voucher)}
                            >
                              Purchase
                            </Button>
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

        <Card>
          <CardHeader>
            <CardTitle>Redeemed Vouchers</CardTitle>
          </CardHeader>
          <CardContent>
            {userVoucher.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No vouchers redeemed.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableBody>
                    <ScrollArea
                      type="always"
                      style={
                        userVoucher.length > 4
                          ? { height: "40vh" }
                          : { height: "15vh" }
                      }
                    >
                      <TableRow>
                        <TableHead>Voucher Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Valid Till</TableHead>
                      </TableRow>
                      {userVoucher.map((voucher) => (
                        <TableRow key={voucher.id}>
                          <TableCell>{voucher.voucher_name}</TableCell>
                          <TableCell>{voucher.description}</TableCell>
                          <TableCell>{voucher.code}</TableCell>
                          <TableCell>{voucher.valid_till}</TableCell>
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
      {voucherDialog && (
        <RedeemVoucherDialog
          voucher={voucherDialog}
          open={!!voucherDialog}
          onOpenChange={(open) => !open && setVoucherDialog(null)}
          onSuccess={fetchVouchers}
        />
      )}
    </div>
  );
}
