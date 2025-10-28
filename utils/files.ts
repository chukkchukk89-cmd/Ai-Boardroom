export const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error('Failed to read file as text'));
            }
        };
        reader.onerror = () => {
            reject(new Error('Error reading file'));
        };
        reader.readAsText(file);
    });
};
