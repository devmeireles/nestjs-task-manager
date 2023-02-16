export interface IServerConfig {
    port: number;
}

export interface IDatabaseConfig {
    port: number;
    host: string;
    type: string;
    username: string;
    password: string;
    database: string;
    synchronize: boolean
}

export interface IJwtConfig {
    experiresIn?: number;
    secret?: string;
}