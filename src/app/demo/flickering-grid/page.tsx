"use client";

import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Copy, Share2 } from "lucide-react";

export default function FlickeringGridDemo() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const code = `import { FlickeringGrid } from "@/components/magicui/flickering-grid";

<FlickeringGrid
  squareSize={4}
  gridGap={6}
  flickerChance={0.3}
  color="rgb(0, 0, 0)"
  maxOpacity={0.2}
  className="absolute inset-0"
/>`;
    
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header with FlickeringGrid background */}
      <header className="relative h-64 flex items-center justify-center overflow-hidden">
        <FlickeringGrid
          squareSize={4}
          gridGap={6}
          flickerChance={0.3}
          color="rgb(100, 100, 100)"
          maxOpacity={0.2}
          className="absolute inset-0"
        />
        <div className="relative z-10 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Flickering Grid Demo</h1>
          <p className="text-white/80">A mesmerizing animated grid component</p>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-lg border p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Usage</h2>
            <p className="text-muted-foreground mb-4">
              The FlickeringGrid component creates an animated grid of squares that randomly flicker.
              Perfect for backgrounds and decorative elements.
            </p>
            
            <div className="bg-muted rounded-md p-4 mb-4">
              <pre className="text-sm overflow-x-auto">
                {`import { FlickeringGrid } from "@/components/magicui/flickering-grid";

<FlickeringGrid
  squareSize={4}
  gridGap={6}
  flickerChance={0.3}
  color="rgb(0, 0, 0)"
  maxOpacity={0.2}
  className="absolute inset-0"
/>`}
              </pre>
            </div>
            
            <Button onClick={copyToClipboard} variant="secondary">
              <Copy className="mr-2 h-4 w-4" />
              {copied ? "Copied!" : "Copy Code"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-xl font-semibold mb-4">Props</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">squareSize</h4>
                  <p className="text-sm text-muted-foreground">number (default: 4) - Size of each square in the grid</p>
                </div>
                <div>
                  <h4 className="font-medium">gridGap</h4>
                  <p className="text-sm text-muted-foreground">number (default: 6) - Gap between squares in the grid</p>
                </div>
                <div>
                  <h4 className="font-medium">flickerChance</h4>
                  <p className="text-sm text-muted-foreground">number (default: 0.3) - Probability of a square flickering</p>
                </div>
                <div>
                  <h4 className="font-medium">color</h4>
                  <p className="text-sm text-muted-foreground">string (default: "rgb(0, 0, 0)") - Color of the squares</p>
                </div>
                <div>
                  <h4 className="font-medium">maxOpacity</h4>
                  <p className="text-sm text-muted-foreground">number (default: 0.2) - Maximum opacity of the squares</p>
                </div>
                <div>
                  <h4 className="font-medium">width / height</h4>
                  <p className="text-sm text-muted-foreground">number - Dimensions of the canvas (optional)</p>
                </div>
                <div>
                  <h4 className="font-medium">className</h4>
                  <p className="text-sm text-muted-foreground">string - Additional CSS classes for the container</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-xl font-semibold mb-4">Examples</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Blue Grid</h4>
                  <div className="h-32 rounded-md overflow-hidden relative">
                    <FlickeringGrid
                      squareSize={3}
                      gridGap={5}
                      flickerChance={0.2}
                      color="rgb(59, 130, 246)"
                      maxOpacity={0.3}
                      className="absolute inset-0"
                    />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Green Grid</h4>
                  <div className="h-32 rounded-md overflow-hidden relative">
                    <FlickeringGrid
                      squareSize={5}
                      gridGap={4}
                      flickerChance={0.4}
                      color="rgb(34, 197, 94)"
                      maxOpacity={0.4}
                      className="absolute inset-0"
                    />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Purple Grid</h4>
                  <div className="h-32 rounded-md overflow-hidden relative">
                    <FlickeringGrid
                      squareSize={2}
                      gridGap={8}
                      flickerChance={0.5}
                      color="rgb(168, 85, 247)"
                      maxOpacity={0.25}
                      className="absolute inset-0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Usage Example */}
          <div className="bg-card rounded-lg border p-6 mt-8">
            <h3 className="text-xl font-semibold mb-4">Advanced Usage - Chat Header</h3>
            <p className="text-muted-foreground mb-4">
              Example of using FlickeringGrid in a chat header with text overlay:
            </p>
            
            <div className="relative h-32 rounded-md overflow-hidden mb-4">
              <FlickeringGrid
                squareSize={3}
                gridGap={5}
                flickerChance={0.1}
                color="rgb(255, 255, 255)"
                maxOpacity={0.1}
                className="absolute inset-0"
              />
              <div className="relative z-10 flex items-center justify-between h-full px-6">
                <h1 className="text-xl font-bold text-white">AI Assistant</h1>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
            
            <div className="bg-muted rounded-md p-4">
              <pre className="text-sm overflow-x-auto">
                {`<header className="relative h-16 overflow-hidden">
  <FlickeringGrid
    squareSize={3}
    gridGap={5}
    flickerChance={0.1}
    color="rgb(255, 255, 255)"
    maxOpacity={0.1}
    className="absolute inset-0"
  />
  <div className="relative z-10 flex items-center justify-between h-full px-4">
    <h1 className="text-xl font-bold text-white">AI Assistant</h1>
    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
      <Share2 className="h-4 w-4 mr-2" />
      Share
    </Button>
  </div>
</header>`}
              </pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}