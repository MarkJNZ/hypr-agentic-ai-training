export interface Application {
    id: string;
    name: string;
    comments: string;
    configurationIds?: string[];
}

export interface ApplicationCreate {
    name: string;
    comments: string;
}

export interface ApplicationUpdate {
    name?: string;
    comments?: string;
}

export interface Configuration {
    id: string;
    applicationId: string;
    name: string;
    comments: string;
    config: Record<string, any>;
}

export interface ConfigurationCreate {
    applicationId: string;
    name: string;
    comments: string;
    config: Record<string, any>;
}

export interface ConfigurationUpdate {
    name?: string;
    comments?: string;
    config?: Record<string, any>;
}
