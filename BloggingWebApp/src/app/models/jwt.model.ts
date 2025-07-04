export interface JwtPayload {
    sub?: string;         
    nameid?: string;      
    exp?: number;
    role?: string;
}