import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { getWasteTypeLabel } from "@/utils/pointsCalculator";
import { tablesDB } from "@/integrations/supabase/client";
import { Operator, Query } from "appwrite";

interface VerifySubmissionDialogProps {
  submission: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function VerifySubmissionDialog({
  submission,
  open,
  onOpenChange,
  onSuccess,
}: VerifySubmissionDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [code, setCode] = useState("");

  const handleVerify = async (status: "verified" | "rejected") => {
    if (!user) return;
    setLoading(true);

    try {
      if (status == "verified") {
        const data = await tablesDB.getRow({
          databaseId: "68b425c600306430be1c",
          tableId: "submissions",
          queries: [Query.select(["$id"])],
          rowId: submission.$id,
        });
        if (data.$id.slice(0, 8) == code) {
          await tablesDB.updateRow({
            databaseId: "68b425c600306430be1c",
            tableId: "submissions",
            rowId: submission.$id,
            data: {
              verification_status: status,
              verified_at: new Date(),
              verified_by: user.$id,
              verification_comment: comment || "NA",
            },
          });
          await tablesDB.updateRow({
            databaseId: "68b425c600306430be1c",
            tableId: "profiles",
            rowId: submission.user_id,
            data: {
              points_total: Operator.increment(submission.points_earned),
            },
          });
        } else {
          throw new Error("Invalid code");
        }
      } else {
        await tablesDB.updateRow({
          databaseId: "68b425c600306430be1c",
          tableId: "submissions",
          rowId: submission.$id,
          data: {
            verification_status: status,
            verified_at: new Date(),
            verified_by: user.$id,
            verification_comment: comment || "NA",
          },
        });
      }
      toast.success(`Submission ${status}`);
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update submission");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review Submission</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Student</p>
              <p className="font-medium">{submission.user_id?.full_name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">College ID</p>
              <p className="font-mono text-xs">
                {submission.user_id?.college_id}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Type</p>
              <p className="font-medium">
                {getWasteTypeLabel(submission.waste_type)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Quantity</p>
              <p className="font-medium">
                {submission.quantity} {submission.unit}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Points</p>
              <p className="font-bold text-primary">
                {submission.points_earned}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Bin</p>
              <p className="font-medium">{submission.bins?.name || "N/A"}</p>
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="code">Verification Code</Label>
            <Textarea
              id="code"
              placeholder="Enter verification code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={1}
            />
          </div>

          {submission.notes && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Notes</p>
              <p className="text-sm">{submission.notes}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="comment">Comment (Optional)</Label>
            <Textarea
              id="comment"
              placeholder="Add any notes about this verification..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => handleVerify("verified")}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Approve
            </Button>
            <Button
              onClick={() => handleVerify("rejected")}
              disabled={loading}
              variant="destructive"
              className="flex-1"
            >
              Reject
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
