import { NextResponse } from 'next/server';

// Check if GitHub integration is enabled
export async function GET() {
  try {
    const isGithubEnabled = !!process.env.GITHUB_TOKEN;
    
    return NextResponse.json({ 
      enabled: isGithubEnabled,
      message: isGithubEnabled 
        ? 'GitHub integration is enabled' 
        : 'GitHub integration is not configured'
    });
  } catch (error) {
    console.error('Error checking GitHub status:', error);
    return NextResponse.json({ 
      enabled: false, 
      message: 'Error checking GitHub integration status' 
    }, { status: 500 });
  }
}