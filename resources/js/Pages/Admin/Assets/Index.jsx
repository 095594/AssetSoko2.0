import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Index({ assets }) {
    return (
        <AdminLayout>
            <Head title="Manage Assets" />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Assets</h1>
                <Link href={route('admin.assets.create')}>
                    <Button>Add New Asset</Button>
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {assets.data.map((asset) => (
                            <TableRow key={asset.id}>
                                <TableCell>{asset.name}</TableCell>
                                <TableCell>{asset.description}</TableCell>
                                <TableCell>${asset.price}</TableCell>
                                <TableCell>{asset.quantity}</TableCell>
                                <TableCell>{asset.category}</TableCell>
                                <TableCell className="flex space-x-2">
                                    <Link href={route('admin.assets.edit', asset.id)}>
                                        <Button variant="outline" size="sm">Edit</Button>
                                    </Link>
                                    <Button variant="destructive" size="sm">
                                        Delete
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
                    Showing {assets.from} to {assets.to} of {assets.total} assets
                </div>
                <div className="flex gap-2">
                    {assets.prev_page_url && (
                        <Link href={assets.prev_page_url}>
                            <Button variant="outline">Previous</Button>
                        </Link>
                    )}
                    {assets.next_page_url && (
                        <Link href={assets.next_page_url}>
                            <Button variant="outline">Next</Button>
                        </Link>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
