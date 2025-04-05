// global.d.ts
import mongoose from 'mongoose';

export {};


// Create a type for the roles
export type Roles = 'admin' | 'user'
declare global {
    namespace globalThis {
        var mongoose: {
            conn: mongoose.Connection | null;
            promise: Promise<mongoose.Connection> | null;
        };
    }
    interface CustomJwtSessionClaims {
      metadata: {
        role?: Roles
      }
    }
}

