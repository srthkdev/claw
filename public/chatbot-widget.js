(function() {
  // Default configuration
  const defaultConfig = {
    position: 'bottom-right',
    theme: 'light',
    customTitle: 'Chat Assistant',
    customPlaceholder: 'Type your message...',
    customWelcomeMessage: 'Hello! How can I help you today?',
    customButtonLabel: 'Chat with us',
    showBranding: true,
  };

  // Merge user config with default config
  const config = Object.assign({}, defaultConfig, window.chatbotConfig || {});

  // Enhanced markdown parser with better formatting
  function parseMarkdown(text) {
    if (!text) return '';
    
    // Store code blocks temporarily to avoid processing markdown inside them
    const codeBlocks = [];
    let codeBlockCounter = 0;
    
    // Extract code blocks
    text = text.replace(/```([\s\S]*?)```/g, (match, content) => {
      codeBlocks[codeBlockCounter] = match;
      return `{{CODE_BLOCK_${codeBlockCounter++}}}`;
    });
    
    // Extract inline code
    const inlineCodes = [];
    let inlineCodeCounter = 0;
    text = text.replace(/`([^`]+)`/g, (match, content) => {
      inlineCodes[inlineCodeCounter] = content;
      return `{{INLINE_CODE_${inlineCodeCounter++}}}`;
    });
    
    // Convert headers
    text = text.replace(/^###### (.*$)/gm, '<h6>$1</h6>');
    text = text.replace(/^##### (.*$)/gm, '<h5>$1</h5>');
    text = text.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
    text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    
    // Convert bold and italic
    text = text.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert strikethrough
    text = text.replace(/~~(.*?)~~/g, '<del>$1</del>');
    
    // Convert links
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Convert unordered lists
    text = text.replace(/^\s*-\s(.*)$/gm, '<li>$1</li>');
    text = text.replace(/(<li>.*<\/li>\s*)+/g, '<ul>$&</ul>');
    
    // Convert ordered lists
    text = text.replace(/^\s*\d+\.\s(.*)$/gm, '<li>$1</li>');
    text = text.replace(/(<li>.*<\/li>\s*)+/g, '<ol>$&</ol>');
    
    // Restore inline codes
    for (let i = 0; i < inlineCodeCounter; i++) {
      text = text.replace(`{{INLINE_CODE_${i}}}`, `<code class="inline-code">${inlineCodes[i]}</code>`);
    }
    
    // Restore code blocks with syntax highlighting
    for (let i = 0; i < codeBlockCounter; i++) {
      const codeBlockMatch = codeBlocks[i].match(/```(\w+)?\n?([\s\S]*?)\n?```/);
      if (codeBlockMatch) {
        const language = codeBlockMatch[1] || 'plaintext';
        const code = codeBlockMatch[2];
        const escapedCode = code
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        text = text.replace(
          `{{CODE_BLOCK_${i}}}`, 
          `<pre class="code-block"><code class="language-${language}">${escapedCode.trim()}</code></pre>`
        );
      }
    }
    
    // Convert line breaks (but not inside code blocks)
    text = text.replace(/\n/g, '<br>');
    
    // Fix list formatting
    text = text.replace(/<\/ul><br>/g, '</ul>');
    text = text.replace(/<\/ol><br>/g, '</ol>');
    text = text.replace(/<br><li>/g, '<li>');
    
    // Handle paragraphs
    text = text.replace(/<br><br>/g, '</p><p>');
    if (!text.startsWith('<h') && !text.startsWith('<ul') && !text.startsWith('<ol')) {
      text = '<p>' + text + '</p>';
    }
    
    return text;
  }

  // Create widget styles
  const styles = `
    .chat-widget {
      position: fixed;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    
    .chat-widget.bottom-right {
      bottom: 20px;
      right: 20px;
    }
    
    .chat-widget.bottom-left {
      bottom: 20px;
      left: 20px;
    }
    
    .chat-widget.top-right {
      top: 20px;
      right: 20px;
    }
    
    .chat-widget.top-left {
      top: 20px;
      left: 20px;
    }
    
    .chat-toggle {
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 50%;
      width: 60px;
      height: 60px;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    
    .chat-toggle:hover {
      background: #2563eb;
      transform: scale(1.05);
    }
    
    .chat-container {
      position: absolute;
      bottom: 70px;
      right: 0;
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform: translateY(20px);
      opacity: 0;
      transition: all 0.3s ease;
      z-index: 10000;
    }
    
    .chat-container.top {
      bottom: auto;
      top: 70px;
    }
    
    .chat-container.left {
      right: auto;
      left: 0;
    }
    
    .chat-container.open {
      transform: translateY(0);
      opacity: 1;
    }
    
    .chat-container.maximized {
      width: 90vw;
      height: 90vh;
      top: 5vh !important;
      left: 5vw !important;
      bottom: auto !important;
      right: auto !important;
      position: fixed !important;
    }
    
    .chat-header {
      background: #3b82f6;
      color: white;
      padding: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .chat-title {
      font-weight: 600;
      font-size: 16px;
    }
    
    .chat-controls {
      display: flex;
      gap: 8px;
    }
    
    .chat-minimize,
    .chat-maximize,
    .chat-close {
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .chat-messages {
      flex: 1;
      padding: 15px;
      overflow-y: auto;
      background: #f9fafb;
    }
    
    .message {
      margin-bottom: 15px;
      max-width: 80%;
    }
    
    .message.user {
      margin-left: auto;
    }
    
    .message.assistant {
      margin-right: auto;
    }
    
    .message-content {
      padding: 10px 15px;
      border-radius: 18px;
      font-size: 14px;
      line-height: 1.5;
    }
    
    .message.user .message-content {
      background: #3b82f6;
      color: white;
      border-bottom-right-radius: 4px;
    }
    
    .message.assistant .message-content {
      background: #e5e7eb;
      color: #374151;
      border-bottom-left-radius: 4px;
    }
    
    .message.assistant .message-content h1,
    .message.assistant .message-content h2,
    .message.assistant .message-content h3,
    .message.assistant .message-content h4,
    .message.assistant .message-content h5,
    .message.assistant .message-content h6 {
      margin: 12px 0 8px 0;
      color: #1f2937;
      font-weight: 600;
    }
    
    .message.user .message-content h1,
    .message.user .message-content h2,
    .message.user .message-content h3,
    .message.user .message-content h4,
    .message.user .message-content h5,
    .message.user .message-content h6 {
      margin: 12px 0 8px 0;
      color: white;
      font-weight: 600;
    }
    
    .message.assistant .message-content h1 {
      font-size: 1.4em;
    }
    
    .message.assistant .message-content h2 {
      font-size: 1.3em;
    }
    
    .message.assistant .message-content h3 {
      font-size: 1.2em;
    }
    
    .message.assistant .message-content h4 {
      font-size: 1.1em;
    }
    
    .message.assistant .message-content h5,
    .message.assistant .message-content h6 {
      font-size: 1em;
    }
    
    .message.user .message-content h1 {
      font-size: 1.4em;
    }
    
    .message.user .message-content h2 {
      font-size: 1.3em;
    }
    
    .message.user .message-content h3 {
      font-size: 1.2em;
    }
    
    .message.user .message-content h4 {
      font-size: 1.1em;
    }
    
    .message.user .message-content h5,
    .message.user .message-content h6 {
      font-size: 1em;
    }
    
    .message.assistant .message-content p {
      margin: 0 0 10px 0;
    }
    
    .message.user .message-content p {
      margin: 0 0 10px 0;
    }
    
    .message.assistant .message-content strong {
      font-weight: 600;
    }
    
    .message.user .message-content strong {
      font-weight: 600;
    }
    
    .inline-code {
      font-family: monospace;
      background: rgba(0, 0, 0, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.9em;
    }
    
    .message.user .inline-code {
      background: rgba(255, 255, 255, 0.2);
      color: #bfdbfe;
    }
    
    .code-block {
      margin: 12px 0;
      border-radius: 6px;
      overflow: auto;
      max-width: 100%;
    }
    
    .code-block code {
      display: block;
      padding: 12px;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 0.85em;
      line-height: 1.4;
      white-space: pre;
    }
    
    .message.assistant .code-block code {
      background: #1f2937;
      color: #f9fafb;
    }
    
    .message.user .code-block code {
      background: #1e40af;
      color: #dbeafe;
    }
    
    .message.assistant .message-content ul,
    .message.assistant .message-content ol {
      margin: 10px 0;
      padding-left: 20px;
    }
    
    .message.user .message-content ul,
    .message.user .message-content ol {
      margin: 10px 0;
      padding-left: 20px;
    }
    
    .message.assistant .message-content li {
      margin: 5px 0;
    }
    
    .message.user .message-content li {
      margin: 5px 0;
    }
    
    .message.assistant .message-content a {
      color: #3b82f6;
      text-decoration: underline;
    }
    
    .message.user .message-content a {
      color: #bfdbfe;
      text-decoration: underline;
    }
    
    .message.assistant .message-content blockquote {
      border-left: 3px solid #9ca3af;
      padding-left: 12px;
      margin: 10px 0;
      color: #6b7280;
    }
    
    .message.user .message-content blockquote {
      border-left: 3px solid #93c5fd;
      padding-left: 12px;
      margin: 10px 0;
      color: #dbeafe;
    }
    
    .chat-input-container {
      padding: 15px;
      border-top: 1px solid #e5e7eb;
      background: white;
    }
    
    .chat-input {
      width: 100%;
      padding: 12px 15px;
      border: 1px solid #d1d5db;
      border-radius: 24px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }
    
    .chat-input:focus {
      border-color: #3b82f6;
    }
    
    .chat-branding {
      text-align: center;
      padding: 8px;
      font-size: 12px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
    
    .chat-branding a {
      color: #3b82f6;
      text-decoration: none;
    }
    
    .chat-branding a:hover {
      text-decoration: underline;
    }
    
    /* Dark theme */
    .chat-widget.dark .chat-container {
      background: #1f2937;
    }
    
    .chat-widget.dark .chat-messages {
      background: #111827;
    }
    
    .chat-widget.dark .message.assistant .message-content {
      background: #374151;
      color: #f9fafb;
    }
    
    .chat-widget.dark .message.assistant .message-content h1,
    .chat-widget.dark .message.assistant .message-content h2,
    .chat-widget.dark .message.assistant .message-content h3,
    .chat-widget.dark .message.assistant .message-content h4,
    .chat-widget.dark .message.assistant .message-content h5,
    .chat-widget.dark .message.assistant .message-content h6 {
      color: #f9fafb;
    }
    
    .chat-widget.dark .chat-input-container {
      background: #1f2937;
      border-top: 1px solid #374151;
    }
    
    .chat-widget.dark .chat-input {
      background: #111827;
      border: 1px solid #374151;
      color: white;
    }
    
    .chat-widget.dark .chat-branding {
      background: #1f2937;
      border-top: 1px solid #374151;
      color: #9ca3af;
    }
    
    /* Loading indicator */
    .loading-dots {
      display: flex;
      align-items: center;
      padding: 10px 15px;
    }
    
    .loading-dots span {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #374151;
      margin-right: 4px;
      animation: loading 1.4s infinite ease-in-out both;
    }
    
    .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
    .loading-dots span:nth-child(2) { animation-delay: -0.16s; }
    
    @keyframes loading {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1.0); }
    }
    
    .chat-widget.dark .loading-dots span {
      background: #f9fafb;
    }
  `;

  // Create and inject styles
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // Create widget container
  const widget = document.createElement('div');
  widget.className = `chat-widget ${config.position} ${config.theme}`;
  
  // Create toggle button
  const toggleButton = document.createElement('button');
  toggleButton.className = 'chat-toggle';
  toggleButton.innerHTML = '&#128172;'; // Speech balloon emoji
  toggleButton.title = config.customButtonLabel;
  
  // Create chat container
  const chatContainer = document.createElement('div');
  chatContainer.className = 'chat-container';
  
  // Adjust position classes
  if (config.position.includes('top')) {
    chatContainer.classList.add('top');
  }
  if (config.position.includes('left')) {
    chatContainer.classList.add('left');
  }
  
  // Create chat header
  const chatHeader = document.createElement('div');
  chatHeader.className = 'chat-header';
  
  const chatTitle = document.createElement('div');
  chatTitle.className = 'chat-title';
  chatTitle.textContent = config.customTitle;
  
  // Create control buttons
  const controlsDiv = document.createElement('div');
  controlsDiv.className = 'chat-controls';
  
  const minimizeButton = document.createElement('button');
  minimizeButton.className = 'chat-minimize';
  minimizeButton.innerHTML = '&#8211;'; // Minus sign
  minimizeButton.title = 'Minimize';
  
  const maximizeButton = document.createElement('button');
  maximizeButton.className = 'chat-maximize';
  maximizeButton.innerHTML = '&#9723;'; // Square
  maximizeButton.title = 'Maximize';
  
  const closeButton = document.createElement('button');
  closeButton.className = 'chat-close';
  closeButton.innerHTML = '&times;';
  closeButton.title = 'Close chat';
  
  controlsDiv.appendChild(minimizeButton);
  controlsDiv.appendChild(maximizeButton);
  controlsDiv.appendChild(closeButton);
  
  chatHeader.appendChild(chatTitle);
  chatHeader.appendChild(controlsDiv);
  
  // Create messages container
  const messagesContainer = document.createElement('div');
  messagesContainer.className = 'chat-messages';
  
  // Create welcome message
  addMessage(messagesContainer, config.customWelcomeMessage, 'assistant');
  
  // Create input container
  const inputContainer = document.createElement('div');
  inputContainer.className = 'chat-input-container';
  
  const inputField = document.createElement('input');
  inputField.className = 'chat-input';
  inputField.type = 'text';
  inputField.placeholder = config.customPlaceholder;
  inputField.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      sendMessage(inputField.value, messagesContainer, config.chatbotId);
      inputField.value = '';
    }
  });
  
  inputContainer.appendChild(inputField);
  
  // Create branding (if enabled)
  let brandingContainer = null;
  if (config.showBranding !== false) {
    brandingContainer = document.createElement('div');
    brandingContainer.className = 'chat-branding';
    brandingContainer.innerHTML = 'Powered by <a href="https://tidb.cloud" target="_blank">TiDB</a> & <a href="https://openai.com" target="_blank">OpenAI</a>';
  }
  
  // Assemble chat container
  chatContainer.appendChild(chatHeader);
  chatContainer.appendChild(messagesContainer);
  chatContainer.appendChild(inputContainer);
  if (brandingContainer) {
    chatContainer.appendChild(brandingContainer);
  }
  
  // Assemble widget
  widget.appendChild(toggleButton);
  widget.appendChild(chatContainer);
  
  // Add to document
  document.body.appendChild(widget);
  
  // Toggle chat visibility
  toggleButton.addEventListener('click', function() {
    chatContainer.classList.toggle('open');
  });
  
  // Minimize chat
  minimizeButton.addEventListener('click', function(e) {
    e.stopPropagation();
    chatContainer.classList.remove('open');
  });
  
  // Maximize/minimize chat
  maximizeButton.addEventListener('click', function(e) {
    e.stopPropagation();
    chatContainer.classList.toggle('maximized');
    
    // Update button icon based on state
    if (chatContainer.classList.contains('maximized')) {
      maximizeButton.innerHTML = '&#9634;'; // Hollow square for restore
      maximizeButton.title = 'Restore';
    } else {
      maximizeButton.innerHTML = '&#9723;'; // Solid square for maximize
      maximizeButton.title = 'Maximize';
    }
  });
  
  // Close chat
  closeButton.addEventListener('click', function(e) {
    e.stopPropagation();
    chatContainer.classList.remove('open');
    chatContainer.classList.remove('maximized');
    // Reset maximize button icon
    maximizeButton.innerHTML = '&#9723;';
    maximizeButton.title = 'Maximize';
  });
  
  // Close chat when clicking outside
  document.addEventListener('click', function(e) {
    if (!widget.contains(e.target) && chatContainer.classList.contains('open')) {
      chatContainer.classList.remove('open');
    }
  });
  
  // Function to add message to chat with markdown support
  function addMessage(container, text, role) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    // Parse markdown and set as innerHTML
    contentDiv.innerHTML = parseMarkdown(text);
    
    messageDiv.appendChild(contentDiv);
    container.appendChild(messageDiv);
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
  }
  
  // Function to show loading indicator
  function showLoading(container) {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message assistant';
    loadingDiv.id = 'loading-indicator';
    
    const loadingContent = document.createElement('div');
    loadingContent.className = 'loading-dots';
    loadingContent.innerHTML = '<span></span><span></span><span></span>';
    
    loadingDiv.appendChild(loadingContent);
    container.appendChild(loadingDiv);
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
    
    return loadingDiv;
  }
  
  // Function to hide loading indicator
  function hideLoading(container) {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
      container.removeChild(loadingIndicator);
    }
  }
  
  // Function to send message
  async function sendMessage(message, container, chatbotId) {
    if (!message.trim()) return;
    
    // Add user message
    addMessage(container, message, 'user');
    
    // Show loading indicator
    const loadingIndicator = showLoading(container);
    
    try {
      // Use the base URL from config if available, otherwise default to relative path
      const baseUrl = config.baseUrl || '';
      
      // Send to chatbot API
      const response = await fetch(`${baseUrl}/api/chatbots/${chatbotId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          sessionId: 'widget-session-' + Date.now() // Unique session ID
        }),
      });
      
      // Hide loading indicator
      hideLoading(container);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send message');
      }
      
      const data = await response.json();
      
      // Process response to avoid overly long responses for short messages
      let processedResponse = data.response;
      
      // For very short messages like "hi", limit response length
      if (message.trim().toLowerCase().match(/^(hi|hello|hey|greetings)$/)) {
        // Split response into sentences and take only first 2-3 sentences
        const sentences = processedResponse.split(/(?<=[.!?])\s+/);
        if (sentences.length > 3) {
          processedResponse = sentences.slice(0, 3).join(' ') + '...';
        }
      }
      
      // Add assistant response with markdown support
      addMessage(container, processedResponse, 'assistant');
    } catch (error) {
      console.error('Error sending message:', error);
      // Hide loading indicator
      hideLoading(container);
      // Add error message
      addMessage(container, 'Sorry, I encountered an error: ' + (error.message || 'Please try again.'), 'assistant');
    }
  }
})();