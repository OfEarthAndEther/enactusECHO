import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { tablesDB } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import { Operator, Query } from "appwrite";

interface RedeemVoucherDialogProps {
  voucher: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RedeemVoucherDialog({
  voucher,
  open,
  onOpenChange,
  onSuccess,
}: RedeemVoucherDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [amountPurchased, setAmountPurchased] = useState<number>(1);

  const handleVoucher = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const purchaser = await tablesDB.getRow({
        databaseId: "68b425c600306430be1c",
        tableId: "profiles",
        rowId: user.$id,
        queries: [Query.select(["$id", "points_total"])],
      });

      if (purchaser.points_total < voucher.points * amountPurchased) {
        throw new Error("Insufficient points");
      }
      if (voucher.quantity > amountPurchased) {
        await tablesDB.updateRow({
          databaseId: "68b425c600306430be1c",
          tableId: "vouchers",
          rowId: voucher.$id,
          data: { quantity: voucher.quantity - amountPurchased },
        });
      } else {
        const res = await tablesDB.deleteRow({
          databaseId: "68b425c600306430be1c",
          tableId: "vouchers",
          rowId: voucher.$id,
        });
      }

      const { rows: codes } = await tablesDB.listRows({
        databaseId: "68b425c600306430be1c",
        tableId: "availableCodes",
        queries: [
          Query.select(["$id"]),
          Query.equal("name", voucher.name),
          Query.isNull("user_id"),
          Query.limit(amountPurchased),
        ],
      });
      codes.forEach(async (element) => {
        await tablesDB.updateRow({
          databaseId: "68b425c600306430be1c",
          tableId: "availableCodes",
          rowId: element.$id,
          data: { user_id: user.$id },
        });
      });
      await tablesDB.updateRow({
        databaseId: "68b425c600306430be1c",
        tableId: "profiles",
        rowId: user.$id,
        data: {
          points_total:
            purchaser.points_total - voucher.points * amountPurchased,
          redeemed_codes: Operator.arrayAppend(
            codes.map((code) => {
              return code.$id;
            }),
          ),
        },
      });
      toast.success(`Voucher purchased`);
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to redeem voucher");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buy Voucher</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Voucher name</p>
              <p className="font-medium">{voucher.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Points</p>
              <p className="font-bold text-primary">
                {voucher.points * amountPurchased}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">description</p>
              <p className="font-medium">{voucher.description || ""}</p>
            </div>
            <div>
              <Label htmlFor="code">Enter Amount</Label>
              <Slider
                min={1}
                value={[amountPurchased]}
                max={voucher.quantity}
                step={1}
                className="pt-4"
                onValueChange={([newValue]) => setAmountPurchased(newValue)}
              />
            </div>
            <div>
              <p className="font-medium">{amountPurchased}</p>
            </div>
            <div></div>
          </div>

          <div>
            <Button
              onClick={() => handleVoucher()}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Purchase
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
