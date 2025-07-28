import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  StickyNote,
  Shield,
  Smartphone,
  Search,
  Palette,
  Clock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function Index() {
  const features = [
    {
      icon: <StickyNote className="w-6 h-6" />,
      title: "Rich Note Creation",
      description:
        "Create detailed notes with customizable colors and formatting",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure Authentication",
      description:
        "Sign up with email/OTP or Google OAuth for maximum security",
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Powerful Search",
      description:
        "Find your notes instantly with full-text search capabilities",
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Mobile Responsive",
      description: "Access your notes seamlessly across all devices",
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Color Organization",
      description: "Organize notes with beautiful color-coding system",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Real-time Sync",
      description: "Your notes are always up-to-date across all sessions",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <StickyNote className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                NoteTaker
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-800"
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Ideas,{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Beautifully Organized
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            NoteTaker is the modern note-taking app that helps you capture,
            organize, and find your thoughts effortlessly. With powerful
            features and beautiful design.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button
                size="lg"
                className="h-14 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg transition-all duration-200"
              >
                Start Taking Notes
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg"
              >
                Sign In to Your Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Stay Organized
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to make note-taking simple, secure, and
              enjoyable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-4 text-blue-600">
                    {feature.icon}
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose NoteTaker?
              </h3>
              <div className="space-y-4">
                {[
                  "Secure authentication with multiple sign-in options",
                  "Beautiful, intuitive interface that's a joy to use",
                  "Powerful search to find any note instantly",
                  "Color-coded organization system",
                  "Mobile-responsive design for all devices",
                  "Fast, reliable, and always available",
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl transform rotate-6"></div>
              <div className="relative bg-white rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <StickyNote className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Sample Note</h4>
                </div>
                <p className="text-gray-600 mb-4">
                  "Just tried NoteTaker and I'm amazed! The interface is so
                  clean and the search feature helped me find my old notes
                  instantly. Perfect for organizing my thoughts!"
                </p>
                <div className="text-sm text-gray-500">Created 2 hours ago</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Get Organized?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who have transformed their note-taking
            experience.
          </p>
          <Link to="/signup">
            <Button
              size="lg"
              className="h-14 px-8 bg-white text-blue-600 hover:bg-gray-50 font-medium rounded-lg shadow-lg transition-all duration-200"
            >
              Create Your Free Account
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <StickyNote className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                NoteTaker
              </h1>
            </div>
            <p className="text-gray-400">
              © 2024 NoteTaker. Built with ❤️ for better note-taking.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
