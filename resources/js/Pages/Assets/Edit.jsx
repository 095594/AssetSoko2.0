import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { format } from 'date-fns';

export default function Edit({ auth, asset }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: asset.name,
        description: asset.description,
        category: asset.category,
        base_price: asset.base_price,
        auction_end_time: format(new Date(asset.auction_end_time), "yyyy-MM-dd'T'HH:mm"),
        photos: [],
    });

    const [previewUrls, setPreviewUrls] = useState([]);
    const [existingPhotos, setExistingPhotos] = useState(asset.photos || []);

    const handlePhotoChange = (e) => {
        const files = Array.from(e.target.files);
        setData('photos', files);

        // Create preview URLs
        const urls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(urls);
    };

    const removePhoto = (index, isExisting = false) => {
        if (isExisting) {
            const newPhotos = existingPhotos.filter((_, i) => i !== index);
            setExistingPhotos(newPhotos);
        } else {
            const newFiles = [...data.photos];
            newFiles.splice(index, 1);
            setData('photos', newFiles);

            // Remove preview URL
            URL.revokeObjectURL(previewUrls[index]);
            const newUrls = previewUrls.filter((_, i) => i !== index);
            setPreviewUrls(newUrls);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('assets.update', asset.id), {
            onSuccess: () => {
                reset();
                setPreviewUrls([]);
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit Asset</h2>}
        >
            <Head title="Edit Asset" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="name" value="Asset Name" />
                                    <TextInput
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        className="mt-1 block w-full"
                                        autoComplete="name"
                                        isFocused={true}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="description" value="Description" />
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={data.description}
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        rows="4"
                                        onChange={(e) => setData('description', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.description} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="category" value="Category" />
                                    <select
                                        id="category"
                                        name="category"
                                        value={data.category}
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        onChange={(e) => setData('category', e.target.value)}
                                        required
                                    >
                                        <option value="">Select a category</option>
                                        <option value="electronics">Electronics</option>
                                        <option value="furniture">Furniture</option>
                                        <option value="clothing">Clothing</option>
                                        <option value="vehicles">Vehicles</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <InputError message={errors.category} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="base_price" value="Starting Price" />
                                    <TextInput
                                        id="base_price"
                                        type="number"
                                        name="base_price"
                                        value={data.base_price}
                                        className="mt-1 block w-full"
                                        min="0"
                                        step="0.01"
                                        onChange={(e) => setData('base_price', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.base_price} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="auction_end_time" value="Auction End Time" />
                                    <TextInput
                                        id="auction_end_time"
                                        type="datetime-local"
                                        name="auction_end_time"
                                        value={data.auction_end_time}
                                        className="mt-1 block w-full"
                                        min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                                        onChange={(e) => setData('auction_end_time', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.auction_end_time} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="photos" value="Add More Photos" />
                                    <input
                                        type="file"
                                        id="photos"
                                        name="photos"
                                        multiple
                                        accept="image/*"
                                        className="mt-1 block w-full"
                                        onChange={handlePhotoChange}
                                    />
                                    <InputError message={errors.photos} className="mt-2" />
                                </div>

                                {(existingPhotos.length > 0 || previewUrls.length > 0) && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                                        {existingPhotos.map((photo, index) => (
                                            <div key={`existing-${index}`} className="relative">
                                                <img
                                                    src={`/storage/${photo}`}
                                                    alt={`Existing ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removePhoto(index, true)}
                                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                        {previewUrls.map((url, index) => (
                                            <div key={`new-${index}`} className="relative">
                                                <img
                                                    src={url}
                                                    alt={`New ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removePhoto(index)}
                                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center justify-end mt-4">
                                    <PrimaryButton disabled={processing}>
                                        Update Asset
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 