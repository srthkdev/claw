import { db } from '@/lib/db';
import { chatbots } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

// Define the valid positions and themes
const VALID_POSITIONS = ['bottom-left', 'bottom-right', 'top-left', 'top-right'];
const VALID_THEMES = ['light', 'dark'];

// Get the script tag for a chatbot
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  try {
    // Note: Script endpoint should not require authentication as it will be accessed by external websites
    // const { userId } = await auth();
    
    const chatbotId = parseInt(params.id);
    
    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: 'Invalid chatbot ID' }, { status: 400 });
    }
    
    const [chatbot] = await db.select().from(chatbots).where(eq(chatbots.id, chatbotId));
    
    if (!chatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
    }
    
    // TODO: Implement domain verification to ensure only authorized domains can use the script
    // For now, we'll generate a basic script tag
    
    const scriptConfig: any = chatbot.scriptConfig || {};
    
    // Validate position and theme
    const position = VALID_POSITIONS.includes(scriptConfig.position) ? scriptConfig.position : 'bottom-right';
    const theme = VALID_THEMES.includes(scriptConfig.theme) ? scriptConfig.theme : 'light';
    
    // Additional customization options
    const customTitle = scriptConfig.customTitle || `${chatbot.name} Assistant`;
    const customPlaceholder = scriptConfig.customPlaceholder || 'Type your message...';
    const customWelcomeMessage = scriptConfig.customWelcomeMessage || `Hello! I'm your ${chatbot.name} assistant. How can I help you today?`;
    const customButtonLabel = scriptConfig.customButtonLabel || 'Chat with us';
    const showBranding = scriptConfig.showBranding !== false; // Default to true
    const headerColor = scriptConfig.headerColor || null;
    const botAvatar = scriptConfig.botAvatar || null;
    const userAvatar = scriptConfig.userAvatar || null;
    
    // Generate the script tag
    const scriptTag = `
<!-- ${chatbot.name} Chatbot Widget -->
<script>
  window.chatbotConfig = {
    chatbotId: ${chatbotId},
    position: '${position}',
    theme: '${theme}',
    baseUrl: '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}',
    customTitle: '${customTitle}',
    customPlaceholder: '${customPlaceholder}',
    customWelcomeMessage: \`${customWelcomeMessage}\`,
    customButtonLabel: '${customButtonLabel}',
    showBranding: ${showBranding}${headerColor ? `,\n    headerColor: '${headerColor}'` : ''}${botAvatar ? `,\n    botAvatar: '${botAvatar}'` : ''}${userAvatar ? `,\n    userAvatar: '${userAvatar}'` : ''}
    // Add other configuration options here
  };
</script>
<script src="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/chatbot-widget.js" defer></script>
<!-- End ${chatbot.name} Chatbot Widget -->
`;
    
    return NextResponse.json({ 
      scriptTag,
      chatbotId,
      chatbotName: chatbot.name
    });
  } catch (error) {
    console.error('Error generating script tag:', error);
    return NextResponse.json({ error: 'Failed to generate script tag' }, { status: 500 });
  }
}

// Update chatbot script configuration
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const chatbotId = parseInt(params.id);
    
    if (isNaN(chatbotId)) {
      return NextResponse.json({ error: 'Invalid chatbot ID' }, { status: 400 });
    }
    
    const [chatbot] = await db.select().from(chatbots).where(eq(chatbots.id, chatbotId));
    
    if (!chatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
    }
    
    if (chatbot.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { scriptConfig } = await request.json();
    
    // Validate the script configuration
    const validatedScriptConfig: any = {};
    
    if (scriptConfig) {
      // Validate position
      if (scriptConfig.position && VALID_POSITIONS.includes(scriptConfig.position)) {
        validatedScriptConfig.position = scriptConfig.position;
      }
      
      // Validate theme
      if (scriptConfig.theme && VALID_THEMES.includes(scriptConfig.theme)) {
        validatedScriptConfig.theme = scriptConfig.theme;
      }
      
      // Validate custom title
      if (scriptConfig.customTitle && typeof scriptConfig.customTitle === 'string') {
        validatedScriptConfig.customTitle = scriptConfig.customTitle.substring(0, 100); // Limit to 100 characters
      }
      
      // Validate custom placeholder
      if (scriptConfig.customPlaceholder && typeof scriptConfig.customPlaceholder === 'string') {
        validatedScriptConfig.customPlaceholder = scriptConfig.customPlaceholder.substring(0, 100);
      }
      
      // Validate custom welcome message
      if (scriptConfig.customWelcomeMessage && typeof scriptConfig.customWelcomeMessage === 'string') {
        validatedScriptConfig.customWelcomeMessage = scriptConfig.customWelcomeMessage.substring(0, 500);
      }
      
      // Validate custom button label
      if (scriptConfig.customButtonLabel && typeof scriptConfig.customButtonLabel === 'string') {
        validatedScriptConfig.customButtonLabel = scriptConfig.customButtonLabel.substring(0, 50);
      }
      
      // Validate show branding
      if (typeof scriptConfig.showBranding === 'boolean') {
        validatedScriptConfig.showBranding = scriptConfig.showBranding;
      }
      
      // Validate header color
      if (scriptConfig.headerColor && typeof scriptConfig.headerColor === 'string') {
        // Simple hex color validation
        const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (hexColorRegex.test(scriptConfig.headerColor)) {
          validatedScriptConfig.headerColor = scriptConfig.headerColor;
        }
      }
      
      // Validate bot avatar URL
      if (scriptConfig.botAvatar && typeof scriptConfig.botAvatar === 'string') {
        try {
          new URL(scriptConfig.botAvatar);
          validatedScriptConfig.botAvatar = scriptConfig.botAvatar;
        } catch (e) {
          // Invalid URL, skip
        }
      }
      
      // Validate user avatar URL
      if (scriptConfig.userAvatar && typeof scriptConfig.userAvatar === 'string') {
        try {
          new URL(scriptConfig.userAvatar);
          validatedScriptConfig.userAvatar = scriptConfig.userAvatar;
        } catch (e) {
          // Invalid URL, skip
        }
      }
      
      // Validate and store allowed domains if provided
      if (scriptConfig.allowedDomains) {
        // Parse and validate domains
        const domains = scriptConfig.allowedDomains
          .split(',')
          .map((domain: string) => domain.trim())
          .filter((domain: string) => domain.length > 0);
        
        // Simple domain validation (in a real app, you'd want more robust validation)
        const validDomains = domains.filter((domain: string) => {
          // Allow wildcard domains like *.example.com
          if (domain.startsWith('*.')) {
            return domain.length > 2;
          }
          // Allow specific domains
          return domain.length > 0;
        });
        
        if (validDomains.length > 0) {
          validatedScriptConfig.allowedDomains = validDomains;
        }
      }
    }
    
    // Update the chatbot
    await db.update(chatbots).set({
      scriptConfig: validatedScriptConfig,
      updatedAt: new Date()
    }).where(eq(chatbots.id, chatbotId));
    
    // Select the updated chatbot
    const [updatedChatbot] = await db.select().from(chatbots).where(eq(chatbots.id, chatbotId));
    
    return NextResponse.json(updatedChatbot);
  } catch (error) {
    console.error('Error updating script configuration:', error);
    return NextResponse.json({ error: 'Failed to update script configuration' }, { status: 500 });
  }
}