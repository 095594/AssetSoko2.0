import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "@inertiajs/react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../../utils/cropImage";
import { FiUpload } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProfileEdit = ({ auth }) => {
    const user = auth.user;

    const { data, setData, post, processing, errors } = useForm({
        name: user.name || "",
        email: user.email || "",
        theme: user.theme || localStorage.getItem("theme") || "light",
        current_password: "",
        password: "",
        password_confirmation: "",
        profile_picture: null,
    });

    const [imageSrc, setImageSrc] = useState(null);
    const [croppedImage, setCroppedImage] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [showCropper, setShowCropper] = useState(false);

    useEffect(() => {
        document.body.setAttribute("data-theme", data.theme);
        localStorage.setItem("theme", data.theme);
    }, [data.theme]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setImageSrc(reader.result);
                setShowCropper(true);
            };
        }
    };

    const onCropComplete = useCallback((_, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const applyCrop = async () => {
        if (imageSrc && croppedAreaPixels) {
            try {
                const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
                const croppedImageUrl = URL.createObjectURL(croppedImageBlob);
                setCroppedImage(croppedImageUrl);
                setData("profile_picture", croppedImageBlob);
                setShowCropper(false);
            } catch (error) {
                toast.error("Failed to crop image. Please try again.");
            }
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route("profile.update"), {
            forceFormData: true,
            onSuccess: () => toast.success("Profile updated successfully!"),
            onError: () => toast.error("Failed to update profile."),
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <ToastContainer />
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Edit Profile</h2>

                <div className="text-center mb-6">
                    <label className="block cursor-pointer">
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        <div className="relative inline-block">
                        <img
                            src={croppedImage || `/storage/${user.profile_picture}`}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover shadow-md"
                        />

                            <div className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-sm">
                                <FiUpload className="text-gray-700" />
                            </div>
                        </div>
                    </label>
                    {errors.profile_picture && (
                        <p className="text-sm text-red-600 mt-2">{errors.profile_picture}</p>
                    )}
                </div>

                {/* Cropper */}
                {showCropper && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-11/12 max-w-lg flex flex-col items-center">
                            <div className="relative w-full h-[300px]">
                                <Cropper
                                    image={imageSrc}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    onCropChange={setCrop}
                                    onZoomChange={setZoom}
                                    onCropComplete={onCropComplete}
                                />
                            </div>

                            {/* Buttons - Fully Visible Below Cropper */}
                            <div className="flex justify-between gap-4 mt-6 w-full">
                                <button
                                    onClick={applyCrop}
                                    className="w-1/2 bg-green-500 text-white py-2 rounded-md hover:bg-green-600"
                                >
                                    Apply
                                </button>
                                <button
                                    onClick={() => setShowCropper(false)}
                                    className="w-1/2 bg-red-500 text-white py-2 rounded-md hover:bg-red-600"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={submit} className="space-y-6">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <div className="mt-1">
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData("name", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.name && (
                                <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                            )}
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <div className="mt-1">
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData("email", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.email && (
                                <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                            )}
                        </div>
                    </div>

                    {/* Theme Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Select Theme</label>
                        <div className="mt-1">
                            <select
                                value={data.theme}
                                onChange={(e) => setData("theme", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                            </select>
                        </div>
                    </div>

                    {/* Password Update Section */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                                <div className="mt-1">
                                    <input
                                        type="password"
                                        value={data.current_password}
                                        onChange={(e) => setData("current_password", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">New Password</label>
                                <div className="mt-1">
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData("password", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                                <div className="mt-1">
                                    <input
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData("password_confirmation", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {processing ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileEdit;