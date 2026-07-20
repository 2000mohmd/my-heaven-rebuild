import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listOrders, updateOrderStatus, orderStatuses, type OrderStatus } from "@/lib/shop.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({
  component: OrdersPage,
});

function OrdersPage() {
  const fetchOrders = useServerFn(listOrders);
  const updateStatus = useServerFn(updateOrderStatus);
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => fetchOrders(),
  });

  const mutation = useMutation({
    mutationFn: (vars: { order_id: string; status: OrderStatus }) =>
      updateStatus({ data: vars }),
    onSuccess: (_, vars) => {
      toast.success(`Status updated to ${vars.status}`);
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <h1 className="font-display text-3xl">Orders</h1>
      <p className="mt-2 text-sm text-muted-foreground">Latest 50 orders across all countries.</p>

      {isLoading && <p className="mt-6 text-sm text-muted-foreground">Loading orders…</p>}
      {error && <p className="mt-6 text-sm text-destructive">{(error as Error).message}</p>}

      {orders.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="min-w-full text-sm">
            <thead className="bg-blush/30 text-xs uppercase tracking-widest text-foreground/70">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Country</th>
                <th className="px-4 py-3 text-left">Items</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3 font-medium">#{o.number}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(o.date_created).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div>{o.billing.first_name} {o.billing.last_name}</div>
                    <div className="text-xs text-muted-foreground">{o.billing.email}</div>
                  </td>
                  <td className="px-4 py-3">{o.billing.country} · {o.billing.city}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {o.line_items.map((li) => `${li.name} × ${li.quantity}`).join(", ")}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className="rounded-full border border-border bg-background px-2 py-1 text-xs capitalize disabled:opacity-50"
                      value={o.status}
                      disabled={mutation.isPending}
                      onChange={(e) =>
                        mutation.mutate({
                          order_id: o.id,
                          status: e.target.value as OrderStatus,
                        })
                      }
                    >
                      {orderStatuses.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {o.currency} {o.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
