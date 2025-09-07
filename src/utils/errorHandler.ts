import { handleErrorWithRetry } from './retryLogic';

export type TFunction = (key: string, replacements?: { [key: string]: string | number }) => string;

export const handleError = (error: any, t: TFunction, retryCount: number = 0): string => {
    return handleErrorWithRetry(error, t, retryCount);
};