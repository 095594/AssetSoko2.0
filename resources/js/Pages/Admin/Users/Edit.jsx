import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EditUser({ user }) {
    const { data, setData, put, errors, processing } = useForm({
        name: user.name,
        email: user.email,
        role: user.role,
        password: "",
        password_confirmation: "",
    });

    const submit = (e) => {
        e.preventDefault();
        put(route("admin.users.update", user.id));
    };

    return (
        <AdminLayout>
            <Head title="Edit User" />
            <h1 className="text-2xl font-bold mb-6">Edit User</h1>

            <div className="bg-white p-6 rounded-lg shadow">
                <form onSubmit={submit}>
                    <div className="mb-4">
                        <Label>Name</Label>
                        <Input
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                        />
                        {errors.name && <p className="text-red-500">{errors.name}</p>}
                    </div>

                    <div className="mb-4">
                        <Label>Email</Label>
                        <Input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                        />
                        {errors.email && <p className="text-red-500">{errors.email}</p>}
                    </div>

                    <div className="mb-4">
                        <Label>Role</Label>
                        <select
                            className="border rounded w-full p-2"
                            value={data.role}
                            onChange={(e) => setData("role", e.target.value)}
                        >
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                        </select>
                        {errors.role && <p className="text-red-500">{errors.role}</p>}
                    </div>

                    <div className="mb-4">
                        <Label>Password (Leave blank to keep current password)</Label>
                        <Input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData("password", e.target.value)}
                        />
                        {errors.password && <p className="text-red-500">{errors.password}</p>}
                    </div>

                    <div className="mb-4">
                        <Label>Confirm Password</Label>
                        <Input
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData("password_confirmation", e.target.value)}
                        />
                    </div>

                    <div className="flex gap-4">
                        <Button type="submit" disabled={processing}>
                            Save Changes
                        </Button>
                        <Button variant="outline" href={route("admin.users.index")}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
