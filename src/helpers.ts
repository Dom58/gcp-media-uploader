const generateRandomNumberString = (): string => {
    return Math.random().toString(36).substring(2, 8);
}

const sanitizeFileName = (originalName: string): string => {
    return originalName.replace(/[^\w\s]/gi, '_').replace(/\s+/g, '_');
}

export { generateRandomNumberString, sanitizeFileName };
