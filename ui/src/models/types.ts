export interface Application {
    id: string;
    name: string;
    comments: string;
    configuration_ids?: string[];
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
    application_id: string;
    name: string;
    comments: string;
    config: Record<string, any>;
}

export interface ConfigurationCreate {
    application_id: string;
    name: string;
    comments: string;
    config: Record<string, any>;
}

export interface ConfigurationUpdate {
    name?: string;
    comments?: string;
    config?: Record<string, any>;
}
