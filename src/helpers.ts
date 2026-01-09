const generateRandomNumberString = (): string => {
    return Math.random().toString(36).substring(2, 8);
}

const sanitizeFileName = (originalName: string): string => {
    const lastDotIndex = originalName.lastIndexOf('.');
    const baseName = lastDotIndex >= 0 ? originalName.substring(0, lastDotIndex) : originalName; // Get the base name
    const extension = lastDotIndex >= 0 ? originalName.substring(lastDotIndex) : ''; // Get the extension

    const sanitizedBaseName = baseName.replace(/[^\w\s]/gi, '_').replace(/\s+/g, '_');
    return sanitizedBaseName + extension;
}

export { generateRandomNumberString, sanitizeFileName };
