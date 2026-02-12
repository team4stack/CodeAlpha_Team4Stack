import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// Get contact settings
export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session');

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // First, ensure table exists
    try {
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
    } catch (tableError) {
      // Table might already exist, continue
      console.log('Table creation check:', tableError);
    }

    // Get contact settings (create default if not exists)
    let result: Array<{ whatsapp: string; phone: string; email: string; address: string }> = [];
    try {
      result = await sql`
        SELECT whatsapp, phone, email, address FROM contact_settings LIMIT 1
      ` as Array<{ whatsapp: string; phone: string; email: string; address: string }>;
    } catch (selectError) {
      console.error('Error selecting contact settings:', selectError);
    }

    if (result.length === 0) {
      // Return default values if no settings exist
      const defaultSettings = {
        whatsapp: '923001234567',
        phone: '+92 300 1234567',
        email: 'info@alqadir.com',
        address: 'Vehari, Pakistan'
      };
      
      // Try to create default settings
      try {
        await sql`
          INSERT INTO contact_settings (id, whatsapp, phone, email, address)
          VALUES (1, ${defaultSettings.whatsapp}, ${defaultSettings.phone}, ${defaultSettings.email}, ${defaultSettings.address})
          ON CONFLICT (id) DO NOTHING
        `;
      } catch (insertError) {
        console.error('Error inserting default settings:', insertError);
      }
      
      return NextResponse.json({
        success: true,
        settings: defaultSettings,
      });
    }

    return NextResponse.json({
      success: true,
      settings: {
        whatsapp: result[0].whatsapp,
        phone: result[0].phone,
        email: result[0].email,
        address: result[0].address,
      },
    });
  } catch (error) {
    console.error('Get contact settings error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to get contact settings',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}

// Update contact settings
export async function PUT(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session');

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { whatsapp, phone, email, address } = await request.json();

    if (!whatsapp) {
      return NextResponse.json(
        { error: 'WhatsApp number is required' },
        { status: 400 }
      );
    }

    // First, try to create table if it doesn't exist
    try {
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
    } catch (tableError) {
      // Table might already exist, continue
      console.log('Table creation check:', tableError);
    }

    // Check if settings exist
    let existing: Array<{ id: number }> = [];
    try {
      existing = await sql`
        SELECT id FROM contact_settings LIMIT 1
      ` as Array<{ id: number }>;
    } catch (selectError) {
      console.error('Error checking existing settings:', selectError);
      // If table doesn't exist, create it and insert
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
    }

    if (existing.length === 0) {
      // Create new settings
      try {
        await sql`
          INSERT INTO contact_settings (id, whatsapp, phone, email, address)
          VALUES (1, ${whatsapp}, ${phone || ''}, ${email || ''}, ${address || ''})
          ON CONFLICT (id) DO UPDATE SET
            whatsapp = ${whatsapp},
            phone = ${phone || ''},
            email = ${email || ''},
            address = ${address || ''},
            updated_at = CURRENT_TIMESTAMP
        `;
      } catch (insertError) {
        // If constraint error, try update instead
        await sql`
          UPDATE contact_settings 
          SET whatsapp = ${whatsapp},
              phone = ${phone || ''},
              email = ${email || ''},
              address = ${address || ''},
              updated_at = CURRENT_TIMESTAMP
          WHERE id = 1
        `;
      }
    } else {
      // Update existing settings
      await sql`
        UPDATE contact_settings 
        SET whatsapp = ${whatsapp},
            phone = ${phone || ''},
            email = ${email || ''},
            address = ${address || ''},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existing[0].id}
      `;
    }

    return NextResponse.json({
      success: true,
      message: 'Contact settings updated successfully',
      settings: {
        whatsapp,
        phone: phone || '',
        email: email || '',
        address: address || '',
      },
    });
  } catch (error: unknown) {
    console.error('Update contact settings error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to update contact settings',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}

