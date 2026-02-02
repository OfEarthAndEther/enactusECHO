import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { RedeemVoucherDialog } from "@/components/RedeemVoucher";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, RedoDot } from "lucide-react";
import { tablesDB } from "@/integrations/supabase/client";
import { Query } from "appwrite";
export default function Vouchers() {
  const { user } = useAuth();
  const [vouchers, setVouchers] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voucherDialog, setVoucherDialog] = useState(null);
  const [nameDescription, setNameDescription] = useState<Map<
    string,
    string
  > | null>(null);

  const fetchVouchers = async () => {
    if (!user) return;
    try {
      const profileData = await tablesDB.getRow({
        databaseId: "68b425c600306430be1c",
        tableId: "profiles",
        rowId: user.$id,
      });
      if (profileData.redeemed_codes[0]) {
        const { rows: redeemed } = await tablesDB.listRows({
          databaseId: "68b425c600306430be1c",
          tableId: "availableCodes",
          queries: [
            Query.equal("$id", profileData.redeemed_codes),
            Query.select(["name", "code", "valid_till"]),
          ],
          total: false,
        });
        profileData.redeemed_codes = redeemed;
      }

      const { rows: voucherRows } = await tablesDB.listRows({
        databaseId: "68b425c600306430be1c",
        tableId: "vouchers",
        total: false,
      });
      const newMap = new Map();
      voucherRows.forEach((element) => {
        newMap.set(element.name, element.description);
      });
      setProfile(profileData);
      console.log(profileData);
      setNameDescription(newMap);
      setVouchers(voucherRows);
    } catch (error: any) {
      toast.error("Failed to fetch vouchers");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchVouchers();
  }, [user]);
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
            Welcome back, {profile.full_name}!
          </h1>
          <p className="text-muted-foreground">Redeem your vouchers here</p>
        </div>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex flex-row justify-between">
              <p>Available Vouchers</p>
              <p className="">
                Your points:{" "}
                <p className="text-primary inline">{profile?.points_total}</p>
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
                        vouchers.length >= 4
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
                        <TableRow key={voucher.$id}>
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
            {profile.redeemed_codes[0] == null ? (
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
                        [profile.redeemed_codes].length > 4
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
                      {profile.redeemed_codes.map((voucher) => (
                        <TableRow key={voucher.$id}>
                          <TableCell>{voucher.name}</TableCell>
                          <TableCell>
                            {nameDescription.get(voucher.name)}
                          </TableCell>
                          <TableCell>{voucher.code}</TableCell>
                          <TableCell>
                            {format(
                              new Date(voucher.valid_till),
                              "MMM dd, yyyy",
                            )}
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
