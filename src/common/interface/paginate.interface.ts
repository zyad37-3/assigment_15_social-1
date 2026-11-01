export interface IPaginate<T> {
    pages: number;
    currentPage: number;
    limit: number;
    count:number;
    docs: T[]
} 