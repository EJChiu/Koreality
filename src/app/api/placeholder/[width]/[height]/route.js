import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  // Get the width and height from the URL parameters
  const { width, height } = params;

  // Create an SVG placeholder image
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#cccccc"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#666666" font-family="Arial" font-size="14">${width}x${height}</text>
    </svg>
  `;

  // Return the SVG as a response
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
    },
  });
}
