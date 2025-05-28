import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import ReminderLog, { IReminderLog } from '../../../models/ReminderLog';

export async function POST(req: Request) {
  try {
    // Connect to the database
    await dbConnect();
    
    // Get the data from the request
    const data = await req.json();
    
    // Create a new reminder log
    const reminderLog = await ReminderLog.create(data);
    
    // Return the created reminder log
    return NextResponse.json(reminderLog, { status: 201 });
  } catch (error) {
    console.error('Error saving reminder log:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save reminder log', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Connect to the database
    await dbConnect();
    
    // Get all reminder logs
    const logs = await ReminderLog.find({}).sort({ sentAt: -1 });
    
    // Return the logs
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching reminder logs:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch reminder logs', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 