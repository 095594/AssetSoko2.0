import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function UsersIndex({ users }) {
    const { delete: destroy, processing } = useForm();

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this user?")) {
            destroy(route("admin.users.destroy", id));
        }
    };

    return (
        <AdminLayout>
            <Head title="Manage Users" />
            <h1 className="text-2xl font-bold mb-6">Users</h1>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {users.data.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell className="flex space-x-2">
                                    <Link href={route('admin.users.edit', user.id)}>
                                        <Button variant="outline" size="sm">Edit</Button>
                                    </Link>
                                    <Button 
                                        variant="destructive" 
                                        size="sm" 
                                        disabled={processing}
                                        onClick={() => handleDelete(user.id)}
                                    >
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
                    Showing {users.from} to {users.to} of {users.total} users
                </div>
                <div className="flex gap-2">
                    {users.prev_page_url && (
                        <Link href={users.prev_page_url}>
                            <Button variant="outline">Previous</Button>
                        </Link>
                    )}
                    {users.next_page_url && (
                        <Link href={users.next_page_url}>
                            <Button variant="outline">Next</Button>
                        </Link>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
