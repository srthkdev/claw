import { Octokit } from '@octokit/rest';
import pdf from 'pdf-parse';

// Initialize Octokit with GitHub token
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN || undefined,
});

// Function to fetch repository contents
export async function fetchGitHubRepoContents(owner: string, repo: string, path: string = '') {
  try {
    // Check if GITHUB_TOKEN is defined
    if (!process.env.GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN is not defined in environment variables. Please add a GitHub Personal Access Token to enable GitHub repository ingestion.');
    }
    
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
    });
    
    return data;
  } catch (error: any) {
    console.error('Error fetching GitHub repo contents:', error);
    
    // Provide more specific error messages
    if (error.status === 401) {
      throw new Error('Invalid GitHub token. Please check your GITHUB_TOKEN environment variable.');
    } else if (error.status === 404) {
      throw new Error(`GitHub repository not found: ${owner}/${repo}`);
    }
    
    throw new Error('Failed to fetch GitHub repository contents: ' + (error.message || 'Unknown error'));
  }
}

// Function to fetch file content
export async function fetchGitHubFileContent(owner: string, repo: string, path: string) {
  try {
    // Check if GITHUB_TOKEN is defined
    if (!process.env.GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN is not defined in environment variables. Please add a GitHub Personal Access Token to enable GitHub repository ingestion.');
    }
    
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
    });
    
    // Decode base64 content
    if ('content' in data) {
      const contentBuffer = Buffer.from(data.content, 'base64');
      
      // Check if it's a PDF file
      if (path.toLowerCase().endsWith('.pdf')) {
        try {
          // Extract text from PDF
          const pdfData = await pdf(contentBuffer);
          return pdfData.text;
        } catch (pdfError) {
          console.error('Error extracting text from PDF:', pdfError);
          // Return empty string or some indication that PDF parsing failed
          return '[PDF content could not be extracted]';
        }
      }
      
      // Handle other file types normally
      return contentBuffer.toString('utf-8');
    }
    
    return '';
  } catch (error: any) {
    console.error('Error fetching GitHub file content:', error);
    
    // Provide more specific error messages
    if (error.status === 401) {
      throw new Error('Invalid GitHub token. Please check your GITHUB_TOKEN environment variable.');
    } else if (error.status === 404) {
      throw new Error(`File not found in GitHub repository: ${owner}/${repo}/${path}`);
    }
    
    throw new Error('Failed to fetch GitHub file content: ' + (error.message || 'Unknown error'));
  }
}

// Function to extract documentation files from a repository
export async function extractDocumentationFiles(owner: string, repo: string) {
  try {
    // Check if GITHUB_TOKEN is defined
    if (!process.env.GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN is not defined in environment variables. Please add a GitHub Personal Access Token to enable GitHub repository ingestion.');
    }
    
    const files: { path: string; content: string; type: string }[] = [];
    
    // Fetch root directory contents
    const rootContents = await fetchGitHubRepoContents(owner, repo);
    
    // Process each item in the root directory
    if (Array.isArray(rootContents)) {
      for (const item of rootContents) {
        if (item.type === 'dir') {
          // For directories, we'll check common documentation directories
          if (['docs', 'documentation', 'doc', 'guide', 'guides'].includes(item.name)) {
            await processDirectory(owner, repo, item.path, files);
          }
        } else if (item.type === 'file') {
          // For files, check if they are documentation files
          if (isDocumentationFile(item.name)) {
            const content = await fetchGitHubFileContent(owner, repo, item.path);
            files.push({
              path: item.path,
              content,
              type: item.name.split('.').pop() || 'unknown',
            });
          }
        }
      }
    }
    
    return files;
  } catch (error) {
    console.error('Error extracting documentation files:', error);
    throw new Error('Failed to extract documentation files from repository: ' + (error as Error).message);
  }
}

// Helper function to process directory contents recursively
async function processDirectory(
  owner: string,
  repo: string,
  path: string,
  files: { path: string; content: string; type: string }[]
) {
  try {
    const contents = await fetchGitHubRepoContents(owner, repo, path);
    
    if (Array.isArray(contents)) {
      for (const item of contents) {
        if (item.type === 'dir') {
          // Recursively process subdirectories
          await processDirectory(owner, repo, item.path, files);
        } else if (item.type === 'file' && isDocumentationFile(item.name)) {
          // Process documentation files
          const content = await fetchGitHubFileContent(owner, repo, item.path);
          files.push({
            path: item.path,
            content,
            type: item.name.split('.').pop() || 'unknown',
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${path}:`, error);
  }
}

// Helper function to check if a file is a documentation file
function isDocumentationFile(filename: string): boolean {
  const docExtensions = [
    'md', 'mdx', 'txt', 'html', 'htm', 'rst', 'adoc', 'asciidoc',
    'wiki', 'mediawiki', 'tex', 'latex', 'pdf'
  ];
  
  const docFilenames = [
    'readme', 'readme.md', 'readme.mdx', 'readme.txt',
    'license', 'license.md', 'license.txt',
    'changelog', 'changelog.md', 'changelog.txt',
    'contributing', 'contributing.md', 'contributing.txt',
    'authors', 'authors.md', 'authors.txt'
  ];
  
  const lowerFilename = filename.toLowerCase();
  
  // Check file extensions
  const extension = lowerFilename.split('.').pop();
  if (extension && docExtensions.includes(extension)) {
    return true;
  }
  
  // Check specific filenames
  if (docFilenames.includes(lowerFilename)) {
    return true;
  }
  
  return false;
}