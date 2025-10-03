/**
 * Converts a product image path to a full URL
 * @param imagePath - The image path from the API (can be relative or absolute)
 * @returns Full image URL or null if no image
 */
export const getProductImageUrl = (imagePath: string | null | undefined): string | null => {
    if (!imagePath) return null;

    // Already a full URL
    if (imagePath.startsWith('http')) return imagePath;

    // Convert relative path to full URL
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    const mediaBaseUrl = baseUrl.replace('/api/v1', '');
    return `${mediaBaseUrl}${imagePath}`;
};
