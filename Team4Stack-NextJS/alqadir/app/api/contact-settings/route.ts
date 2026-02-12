import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// Public endpoint to get contact settings (no auth required)
// Optimized for fast response - returns defaults immediately if table doesn't exist
export async function GET() {
  try {
    // Try to get contact settings directly (fast path)
    const result = await sql`
      SELECT whatsapp, phone, email, address FROM contact_settings LIMIT 1
    ` as Array<{ whatsapp: string; phone: string; email: string; address: string }>;

    if (result.length > 0) {
      return NextResponse.json({
        success: true,
        settings: {
          whatsapp: result[0].whatsapp,
          phone: result[0].phone,
          email: result[0].email,
          address: result[0].address,
        },
      });
    }

    // If no result, return defaults immediately (don't wait for table creation)
    return NextResponse.json({
      success: true,
      settings: {
        whatsapp: '923001234567',
        phone: '+92 300 1234567',
        email: 'info@alqadir.com',
        address: 'Vehari, Pakistan'
      },
    });
  } catch (error) {
    // On any error (including table not found), return defaults immediately
    // This ensures fast response even if database is slow or table doesn't exist
    return NextResponse.json({
      success: true,
      settings: {
        whatsapp: '923001234567',
        phone: '+92 300 1234567',
        email: 'info@alqadir.com',
        address: 'Vehari, Pakistan'
      },
    });
  }
}

