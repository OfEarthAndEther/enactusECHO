import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";

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
      const { data: purchaser, error: profileError } = await supabase
        .from("profiles")
        .select("id, points_total")
        .eq("id", user.id)
        .single();
      if (profileError) throw profileError;

      if (purchaser.points_total < voucher.points * amountPurchased) {
        throw new Error("Insufficient points");
      }
      if (voucher.quantity > amountPurchased) {
        const { error } = await supabase
          .from("vouchers")
          .update({
            quantity: voucher.quantity - amountPurchased,
          })
          .eq("id", voucher.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("vouchers")
          .delete()
          .eq("id", voucher.id);
        if (error) throw error;
      }

      const { data: codes, error: codeError } = await supabase
        .from("availableCodes")
        .select("*")
        .eq("voucher_name", voucher.name)
        .limit(amountPurchased);
      if (codeError) throw codeError;
      console.log(codes);

      const { error: deleteCodeError } = await supabase
        .from("availableCodes")
        .delete()
        .in(
          "code",
          codes.map((code) => {
            return code.code;
          })
        )
        .eq("voucher_name", voucher.name);
      if (deleteCodeError) throw deleteCodeError;

      const { error: updatePointError } = await supabase
        .from("profiles")
        .update({
          points_total:
            purchaser.points_total - voucher.points * amountPurchased,
        })
        .eq("id", user.id);

      const { error: redeemError } = await supabase.from("redeemed").insert(
        codes.map((code) => {
          return {
            ...code,
            user_id: user.id,
            description: voucher.description,
          };
        })
      );
      if (redeemError) throw redeemError;
      toast.success(`Voucher purchased`);
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to redeem voucher");
    } finally {
      setLoading(false);
      console.log(amountPurchased);
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
