import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link } from '@inertiajs/react';
import { formatCurrency } from '@/utils/format';

export default function Index({ auth, assets }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">My Assets</h2>}
        >
            <Head title="My Assets" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold">My Listed Assets</h3>
                                <Link
                                    href={route('my.assets.create')}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    List New Asset
                                </Link>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {assets.data.map((asset) => (
                                    <div key={asset.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                        <div className="aspect-w-16 aspect-h-9">
                                            <img
                                                src={asset.image_url}
                                                alt={asset.name}
                                                className="object-cover w-full h-48"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <h4 className="text-lg font-semibold mb-2">{asset.name}</h4>
                                            <p className="text-gray-600 text-sm mb-2">{asset.description}</p>
                                            <div className="flex justify-between items-center">
                                                <span className="text-lg font-bold text-blue-600">
                                                    {formatCurrency(asset.current_price)}
                                                </span>
                                                <span className={`px-2 py-1 rounded text-sm ${
                                                    asset.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    asset.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                                                </span>
                                            </div>
                                            <div className="mt-4 flex justify-between">
                                                <Link 
                                                    href={route('my.assets.edit', asset.id)}
                                                    className="text-blue-500 hover:text-blue-700"
                                                >
                                                    Edit
                                                </Link>
                                                <Link
                                                    href={route('my.assets.show', asset.id)}
                                                    className="text-blue-500 hover:text-blue-700"
                                                >
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {assets.data.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">You haven't listed any assets yet.</p>
                                    <Link
                                        href={route('my.assets.create')}
                                        className="text-blue-500 hover:text-blue-700 mt-2 inline-block"
                                    >
                                        List your first asset
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}