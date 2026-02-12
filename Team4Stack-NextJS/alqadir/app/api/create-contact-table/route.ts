import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

/**
 * Quick endpoint to create contact_settings table
 * Call this if you get table not found errors
 */
export async function GET() {
  try {
    // Create contact_settings table
    await sql`
      CREATE TABLE IF NOT EXISTS contact_settings (
        id INTEGER PRIMARY KEY DEFAULT 1,
        whatsapp TEXT NOT NULL DEFAULT '923001234567',
        phone TEXT DEFAULT '+92 300 1234567',
        email TEXT DEFAULT 'info@alqadir.com',
        address TEXT DEFAULT 'Vehari, Pakistan',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT single_row CHECK (id = 1)
      )
    `;

    // Insert default row if it doesn't exist
    await sql`
      INSERT INTO contact_settings (id, whatsapp, phone, email, address)
      VALUES (1, '923001234567', '+92 300 1234567', 'info@alqadir.com', 'Vehari, Pakistan')
      ON CONFLICT (id) DO NOTHING
    `;

    return NextResponse.json({
      success: true,
      message: 'Contact settings table created successfully',
    });
  } catch (error) {
    console.error('Failed to create contact_settings table:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create contact_settings table',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}

