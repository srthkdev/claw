import axios from 'axios';
import * as cheerio from 'cheerio';
import pdf from 'pdf-parse';

// Function to crawl a website and extract text content
export async function crawlWebsite(url: string) {
  try {
    // Check if it's a PDF file
    if (url.toLowerCase().endsWith('.pdf')) {
      // Fetch the PDF file
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AIChatbotMaker/1.0; +http://localhost:3000)',
        },
        timeout: 10000, // 10 second timeout
      });
      
      // Extract text from PDF
      const pdfData = await pdf(response.data);
      
      // Extract title from URL or metadata
      const title = url.split('/').pop()?.replace('.pdf', '') || 'PDF Document';
      
      return {
        url,
        title,
        description: pdfData.info?.Title || '',
        content: pdfData.text,
      };
    }
    
    // Fetch the webpage (existing functionality)
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AIChatbotMaker/1.0; +http://localhost:3000)',
      },
      timeout: 10000, // 10 second timeout
    });
    
    // Load HTML into cheerio
    const $ = cheerio.load(response.data);
    
    // Remove script and style elements
    $('script, style, nav, footer, header').remove();
    
    // Extract text content
    const content = $('body').text()
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .trim();
    
    // Extract title
    const title = $('title').text().trim();
    
    // Extract meta description
    const description = $('meta[name="description"]').attr('content') || '';
    
    return {
      url,
      title,
      description,
      content,
    };
  } catch (error) {
    console.error('Error crawling website:', error);
    throw new Error(`Failed to crawl website: ${error}`);
  }
}

// Function to extract links from a webpage
export async function extractLinks(url: string) {
  try {
    // Fetch the webpage
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AIChatbotMaker/1.0; +http://localhost:3000)',
      },
      timeout: 10000, // 10 second timeout
    });
    
    // Load HTML into cheerio
    const $ = cheerio.load(response.data);
    
    // Extract all links
    const links: string[] = [];
    $('a[href]').each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        // Convert relative URLs to absolute URLs
        try {
          const absoluteUrl = new URL(href, url).href;
          links.push(absoluteUrl);
        } catch (e) {
          // Skip invalid URLs
        }
      }
    });
    
    // Filter out non-HTTP links and duplicates
    const uniqueLinks = [...new Set(links.filter(link => 
      link.startsWith('http') && 
      !link.includes('mailto:') && 
      !link.includes('tel:') &&
      !link.includes('#')
    ))];
    
    return uniqueLinks;
  } catch (error) {
    console.error('Error extracting links:', error);
    throw new Error(`Failed to extract links: ${error}`);
  }
}

// Function to crawl a website and extract documentation content
export async function crawlDocumentationSite(baseUrl: string, maxDepth: number = 2) {
  try {
    const visitedUrls = new Set<string>();
    const documents: { url: string; title: string; content: string }[] = [];
    
    // Start with the base URL
    const urlsToVisit = [baseUrl];
    let currentDepth = 0;
    
    while (urlsToVisit.length > 0 && currentDepth < maxDepth) {
      const currentUrls = [...urlsToVisit];
      urlsToVisit.length = 0; // Clear the array
      
      // Process all URLs at the current depth
      for (const url of currentUrls) {
        // Skip if already visited
        if (visitedUrls.has(url)) {
          continue;
        }
        
        // Mark as visited
        visitedUrls.add(url);
        
        try {
          // Crawl the page
          const pageData = await crawlWebsite(url);
          
          // Only include pages with substantial content
          if (pageData.content.length > 100) {
            documents.push({
              url: pageData.url,
              title: pageData.title,
              content: pageData.content,
            });
          }
          
          // Extract links for next depth level if not at max depth
          if (currentDepth < maxDepth - 1) {
            const links = await extractLinks(url);
            
            // Filter links to same domain
            const baseUrlObj = new URL(baseUrl);
            const sameDomainLinks = links.filter(link => {
              try {
                const linkUrl = new URL(link);
                return linkUrl.hostname === baseUrlObj.hostname;
              } catch {
                return false;
              }
            });
            
            // Add to urlsToVisit
            urlsToVisit.push(...sameDomainLinks);
          }
        } catch (error) {
          console.warn(`Failed to crawl ${url}:`, error);
          // Continue with other URLs
        }
      }
      
      currentDepth++;
    }
    
    return documents;
  } catch (error) {
    console.error('Error crawling documentation site:', error);
    throw new Error(`Failed to crawl documentation site: ${error}`);
  }
}