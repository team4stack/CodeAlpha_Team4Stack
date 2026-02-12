import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    // Debug: Log what credentials are being used
    console.log('🔐 Cloudinary Config Check:');
    console.log('  cloud_name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('  api_key:', process.env.CLOUDINARY_API_KEY);
    console.log('  api_secret:', process.env.CLOUDINARY_API_SECRET ? `${process.env.CLOUDINARY_API_SECRET.substring(0, 4)}...` : 'MISSING');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;
    const productName = formData.get('productName') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    if (!category || !productName) {
      return NextResponse.json(
        { error: 'Category and product name are required' },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Upload to Cloudinary - Simple structure: products/{category}/{timestamp}
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `products/${category}`,
          public_id: `${timestamp}`,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    const result = uploadResult as { secure_url: string; public_id: string };
    
    return NextResponse.json({
      success: true,
      url: result.secure_url,
      message: 'File uploaded successfully'
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

