export type TFunction = (key: string, replacements?: { [key: string]: string | number }) => string;

export const handleError = (error: any, t: TFunction): string => {
    console.error(error);

    if (error.message) {
        // You can add more specific error message handling here based on error codes or types
        return error.message;
    }

    return t('unknown_error');
};