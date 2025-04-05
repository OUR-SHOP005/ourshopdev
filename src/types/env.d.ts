declare namespace NodeJS {
    interface ProcessEnv {
        MONGODB_URI: string;
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
        CLERK_SECRET_KEY: string;
        NODE_ENV: 'development' | 'production' | 'test';
    }
}
