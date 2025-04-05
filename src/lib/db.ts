import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) throw new Error("Missing MongoDB URI");

type connectionDB={
  isConnected?:number
}

// Use the global mongoose type
const connection:connectionDB={}


export const connectDB = async ():Promise<void> => {
    if(connection.isConnected){
        console.log("Already connected!")
        return
    }

    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
        try {
            const db = await mongoose.connect(MONGODB_URI);
            connection.isConnected = db.connections[0].readyState;
            console.log("Db connected!");
            return; // Connection successful, exit the function
        } catch (err) {
            retries++;
            console.log(`Error in db.ts (Attempt ${retries}/${maxRetries}): ${err}`);
            // Wait for a bit before retrying (optional)
            await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // Exponential backoff
        }
    }

    console.error("Failed to connect to the database after multiple retries.");
    process.exit(1); // Exit with an error code
};

export default connectDB;