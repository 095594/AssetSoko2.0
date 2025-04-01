import AdminLayout from "@/Layouts/AdminLayout";
import { Head } from "@inertiajs/react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function OrdersIndex({ orders }) {
    return (
        <AdminLayout>
            <Head title="Manage Orders" />
            <h1 className="text-2xl font-bold mb-6">Orders</h1>

            <div className="bg-white rounded-lg shadow">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Total Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.data.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell>{order.id}</TableCell>
                                <TableCell>{order.user.name}</TableCell>
                                <TableCell>${order.total_amount}</TableCell>
                                <TableCell>{order.status}</TableCell>
                                <TableCell>
                                    <Button variant="outline" size="sm" className="mr-2">
                                        View
                                    </Button>
                                    <Button variant="destructive" size="sm">
                                        Cancel
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                    Showing {orders.from} to {orders.to} of {orders.total} orders
                </div>
                <div className="flex gap-2">
                    {orders.prev_page_url && (
                        <Link href={orders.prev_page_url}>
                            <Button variant="outline">Previous</Button>
                        </Link>
                    )}
                    {orders.next_page_url && (
                        <Link href={orders.next_page_url}>
                            <Button variant="outline">Next</Button>
                        </Link>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}