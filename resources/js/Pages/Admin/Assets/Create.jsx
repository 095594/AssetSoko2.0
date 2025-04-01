import AdminLayout from "@/Layouts/AdminLayout";
import { Head, useForm } from "@inertiajs/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CreateAsset() {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        description: "",
        price: 0,
        quantity: 0,
        category: "",
        image_url: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post("/admin/assets");
    };

    return (
        <AdminLayout>
            <Head title="Create Asset" />
            <h1 className="text-2xl font-bold mb-6">Create Asset</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Name"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    error={errors.name}
                />
                <Input
                    label="Description"
                    value={data.description}
                    onChange={(e) => setData("description", e.target.value)}
                    error={errors.description}
                />
                <Input
                    label="Price"
                    type="number"
                    value={data.price}
                    onChange={(e) => setData("price", e.target.value)}
                    error={errors.price}
                />
                <Input
                    label="Quantity"
                    type="number"
                    value={data.quantity}
                    onChange={(e) => setData("quantity", e.target.value)}
                    error={errors.quantity}
                />
                <Input
                    label="Category"
                    value={data.category}
                    onChange={(e) => setData("category", e.target.value)}
                    error={errors.category}
                />
                <Input
                    label="Image URL"
                    value={data.image_url}
                    onChange={(e) => setData("image_url", e.target.value)}
                    error={errors.image_url}
                />
                <Button type="submit" disabled={processing}>
                    Create Asset
                </Button>
            </form>
        </AdminLayout>
    );
}