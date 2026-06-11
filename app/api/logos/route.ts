import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const imagesDir = path.join(process.cwd(), 'public', 'Images');
    
    // Check if directory exists
    if (!fs.existsSync(imagesDir)) {
      return NextResponse.json([]);
    }

    const files = fs.readdirSync(imagesDir);
    
    // Filter for common image extensions and encode spaces
    const logos = files
      .filter(file => /\.(png|jpe?g|svg|webp)$/i.test(file))
      .map(file => `/Images/${encodeURIComponent(file)}`);

    return NextResponse.json(logos);
  } catch (error) {
    console.error('Error reading logos directory:', error);
    return NextResponse.json([], { status: 500 });
  }
}
