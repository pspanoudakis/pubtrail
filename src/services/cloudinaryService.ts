export type CloudinaryUploadResult = {
    url: string;
    publicId: string;
};

const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "";

export const isCloudinaryConfigured = Boolean(cloudName && uploadPreset);

function inferFileNameAndType(
    fileUri: string,
    explicitMime: string | undefined
): { name: string; type: string } {
    const uriExtensionMatch = fileUri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
    const extension = (uriExtensionMatch?.[1] ?? "jpg").toLowerCase();
    const name = `upload-${Date.now()}.${extension}`;
    const type = explicitMime ?? `image/${extension}`;
    return { name, type };
}

export async function uploadMediaToCloudinary(
    fileUri: string,
    options: {
        mimeType?: string;
        folder?: string;
    }
): Promise<CloudinaryUploadResult> {
    if (!isCloudinaryConfigured) {
        throw new Error(
            "Cloudinary is not configured. Set EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME and EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env."
        );
    }

    const { name, type } = inferFileNameAndType(fileUri, options.mimeType);

    const formData = new FormData();
    // React Native's FormData accepts the { uri, name, type } file shape.
    formData.append("file", { uri: fileUri, name, type } as unknown as Blob);
    formData.append("upload_preset", uploadPreset);
    if (options.folder) {
        formData.append("folder", options.folder);
    }

    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(`Cloudinary upload failed (${response.status}): ${errorText}`);
    }

    const json = (await response.json()) as {
        secure_url?: string;
        url?: string;
        public_id?: string;
    };

    const url = json.secure_url ?? json.url;
    if (!url) {
        throw new Error("Cloudinary upload response did not include a URL.");
    }

    return {
        url,
        publicId: json.public_id ?? "",
    };
}
