import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { api, ApiError } from "../../api/client";
import type { ApiResponse, Order } from "../../api/types";
import Modal from "../../components/Modal";

type Props = { order: Order; onClose: () => void };

export default function RefundDialog({ order, onClose }: Props) {
  const queryClient = useQueryClient();

  const refund = useMutation({
    mutationFn: () =>
      api<ApiResponse<Order>>(`/orders/${order.reference}/refund`, { method: "POST" }),
    onSuccess: async () => {
      // სიას სერვერიდან ვიღებთ და არა ლოკალურად ვასწორებთ
      await queryClient.invalidateQueries({ queryKey: ["tickets"] });
      onClose();
    },
  });

  const pending = refund.isPending;
  const message = refund.isError
    ? refund.error instanceof ApiError
      ? refund.error.message
      : "Network error. Please try again."
    : null;

  return (
    <Modal
      open
      onClose={pending ? () => {} : onClose}
      title="Refund this order?"
      subtitle={`#${order.reference}`}
      className="w-[440px]"
    >
      <p className="text-sm text-white/70">
        You'll get ₾{order.totalPrice} back and the seats will be released. This can't be
        undone.
      </p>

      {message && <p className="mt-4 text-xs text-accent">{message}</p>}

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={onClose}
          className="h-11 flex-1 rounded-full bg-white/15 text-xs font-bold hover:bg-white/25 disabled:opacity-50"
        >
          Keep tickets
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => refund.mutate()}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-accent text-xs font-bold hover:bg-accent-hover disabled:cursor-wait disabled:opacity-70"
        >
          {pending && <Loader2 size={14} className="animate-spin" />}
          {message ? "Try again" : "Yes, refund"}
        </button>
      </div>
    </Modal>
  );
}