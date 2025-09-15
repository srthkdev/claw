"use client";

import { useAuth, SignInButton, SignUpButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { RainbowButton } from "@/components/magicui/rainbow-button";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import { 
  Github, 
  Zap, 
  Clock, 
  Globe, 
  Database, 
  Brain, 
  ChevronDown,
  Play,
  CheckCircle,
  Users,
  BarChart3,
  Shield,
  Twitter,
  Linkedin
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Navbar from "@/components/navbar";
import SVGAnimation from "@/components/svg-animation";

export default function Home() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push("/dashboard");
    }
  }, [isSignedIn, router]);

  if (isSignedIn) {
    return null; // Don't render anything while redirecting
  }

  const features = [
    {
      icon: <Zap className="h-8 w-8 text-blue-500" />,
      title: "Lightning Fast Setup",
      description: "Create your AI chatbot in under 5 minutes from your documentation or GitHub repository."
    },
    {
      icon: <Globe className="h-8 w-8 text-green-500" />,
      title: "Multi-Source Training",
      description: "Train your chatbot with websites, documentation, or GitHub repositories."
    },
    {
      icon: <Database className="h-8 w-8 text-purple-500" />,
      title: "TiDB Vector Search",
      description: "Powered by TiDB's native vector search for accurate, semantic responses."
    },
    {
      icon: <Brain className="h-8 w-8 text-orange-500" />,
      title: "Advanced RAG",
      description: "Retrieval-Augmented Generation with embeddings for contextual understanding."
    },
    {
      icon: <Clock className="h-8 w-8 text-red-500" />,
      title: "Real-time Analytics",
      description: "Monitor chatbot performance with detailed analytics and insights."
    },
    {
      icon: <Users className="h-8 w-8 text-teal-500" />,
      title: "Easy Integration",
      description: "Simple script tag integration for websites or API access for apps."
    }
  ];

  const faqs = [
    {
      question: "How long does it take to create a chatbot?",
      answer: "You can create a fully functional chatbot in less than 5 minutes. Just connect your documentation or GitHub repository, and we'll handle the rest."
    },
    {
      question: "What data sources can I use to train my chatbot?",
      answer: "You can train your chatbot using websites, documentation sites, or GitHub repositories. We support various content types including markdown, HTML, and plain text."
    },
    {
      question: "How does the RAG (Retrieval-Augmented Generation) work?",
      answer: "Our system uses TiDB Vector Search to create embeddings of your content. When a user asks a question, we find the most relevant content sections and use them as context for generating accurate responses."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, your data is securely processed and stored. We use industry-standard encryption and follow best practices for data security. Your content is only used to train your chatbot and is not shared with third parties."
    },
    {
      question: "Can I customize the chatbot's appearance?",
      answer: "Absolutely! You can customize the chatbot's position, colors, and messaging to match your brand. We also provide a script tag for easy integration."
    },
    {
      question: "What AI models do you use?",
      answer: "We support multiple AI models including OpenAI's GPT models and Google's Gemini. You can choose the model that best fits your needs and budget."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Background Grid - moved outside the flex container */}
      <div className="fixed inset-0 -z-10">
        <FlickeringGrid
          className="absolute inset-0"
          squareSize={4}
          gridGap={6}
          color="#6366f1"
          maxOpacity={0.3}
          flickerChance={0.1}
        />
      </div>

      <div className="flex flex-col min-h-screen">
        {/* Navigation */}
        <header className="sticky top-4 z-50 mx-auto w-full max-w-7xl px-4">
          <Navbar />
        </header>

        {/* Hero Section */}
        <main className="flex-1">
          <section className="container py-20 md:py-32 mx-auto">
            <div className="flex flex-col items-center text-center gap-8">
              <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 hover:from-blue-100 hover:to-purple-100 dark:from-blue-900 dark:to-purple-900 dark:text-blue-100 dark:hover:from-blue-900 dark:hover:to-purple-900">
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Built for TiDB Hackathon
                </span>
              </Badge>
              
              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl font-bold max-w-3xl leading-tight">
                  Create AI Chatbots for Your Business in{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    5 Minutes
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                  Transform your documentation into powerful AI assistants. Train with GitHub repos, websites, or docs and deploy anywhere.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <SignUpButton mode="modal">
                  <RainbowButton size="lg">
                    Get Started Free
                  </RainbowButton>
                </SignUpButton>
                <Button size="lg" variant="outline" className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Watch Demo
                </Button>
              </div>
              
              <div className="mt-8 rounded-xl border bg-muted/50 p-1 text-sm text-muted-foreground backdrop-blur-sm">
                Built with ❤️ by Sarthak Jain for TiDB Hackathon
              </div>
            </div>
          </section>

          {/* SVG Animation Section */}
          <section className="container py-12 mx-auto">
            <SVGAnimation />
          </section>

          {/* Features Section */}
          <section className="container py-20 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to create intelligent chatbots powered by TiDB Vector Search
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-all hover:-translate-y-1 mx-auto max-w-sm">
                  <CardHeader>
                    <div className="mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* How It Works */}
          <section className="container py-20 bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl backdrop-blur-sm mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Create your AI assistant in three simple steps
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-background/50 rounded-xl border mx-auto max-w-md">
                <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">1</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Connect Your Data</h3>
                <p className="text-muted-foreground">
                  Link your GitHub repository, website, or documentation to train your chatbot.
                </p>
              </div>
              
              <div className="text-center p-6 bg-background/50 rounded-xl border mx-auto max-w-md">
                <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-green-600 dark:text-green-300">2</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Train & Customize</h3>
                <p className="text-muted-foreground">
                  Our system processes your content and creates embeddings for semantic search.
                </p>
              </div>
              
              <div className="text-center p-6 bg-background/50 rounded-xl border mx-auto max-w-md">
                <div className="mx-auto w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-purple-600 dark:text-purple-300">3</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Deploy & Integrate</h3>
                <p className="text-muted-foreground">
                  Add a simple script tag to your website or use our API to integrate anywhere.
                </p>
              </div>
            </div>
          </section>

          {/* Tech Stack */}
          <section className="container py-20 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Powered by Cutting-Edge Tech</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Built with the latest technologies for maximum performance and accuracy
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="bg-card border rounded-xl p-6 backdrop-blur-sm mx-auto max-w-2xl">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Database className="h-6 w-6 text-blue-500" />
                  TiDB Vector Search
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Native vector storage and similarity search</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>HNSW indexes for fast retrieval</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Scalable architecture for high traffic</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>Seamless integration with existing TiDB workflows</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-card border rounded-xl p-6 backdrop-blur-sm mx-auto max-w-2xl">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Brain className="h-6 w-6 text-purple-500" />
                  RAG & Embeddings
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold">Retrieval-Augmented Generation</h4>
                    <p className="text-sm text-muted-foreground">
                      Combines retrieval of relevant documents with generative models for accurate responses.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Semantic Embeddings</h4>
                    <p className="text-sm text-muted-foreground">
                      Converts text to high-dimensional vectors capturing meaning and context.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Contextual Understanding</h4>
                    <p className="text-sm text-muted-foreground">
                      Chatbots understand nuanced queries and provide relevant, contextual answers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Demo Video */}
          <section className="container py-20 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">See It in Action</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Watch how easy it is to create and deploy your AI chatbot
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="aspect-video bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl flex items-center justify-center border-2 border-dashed border-blue-500/30">
                <div className="text-center">
                  <Play className="h-16 w-16 mx-auto mb-4 text-blue-500" />
                  <h3 className="text-2xl font-bold mb-2">Demo Video</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    See how to create a chatbot from your GitHub repository in under 5 minutes
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="container py-20 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to know about Claw
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left hover:underline">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>

          {/* CTA Section */}
          <section className="container py-20 mx-auto">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Create Your AI Assistant?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of businesses using Claw to enhance their customer support and documentation.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <SignUpButton mode="modal">
                  <RainbowButton size="lg">
                    Get Started Free
                  </RainbowButton>
                </SignUpButton>
                <Button size="lg" variant="outline">
                  Schedule a Demo
                </Button>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t bg-background/80 backdrop-blur-sm">
          <div className="container py-12 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">C</span>
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Claw</span>
                </div>
                <p className="text-muted-foreground mb-4 max-w-md">
                  Create powerful AI chatbots for your business in minutes. No coding required.
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Made with</span>
                  <span className="text-red-500">❤️</span>
                  <span>by Sarthak Jain for TiDB Hackathon</span>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Product</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">API Reference</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Connect</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <a 
                      href="https://github.com/srthkdev/claw" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                      <Github className="h-4 w-4" />
                      GitHub
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://twitter.com/srthkdev" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                      <Twitter className="h-4 w-4" />
                      Twitter
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://linkedin.com/in/srthkdev" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
              <p>© {new Date().getFullYear()} Claw. All rights reserved. Built with ❤️ by Sarthak Jain for TiDB Hackathon.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${className}`}>
      {children}
    </div>
  );
}