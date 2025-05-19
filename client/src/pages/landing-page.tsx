import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, 
  User, 
  Baby,
  ShieldCheck, 
  BookOpen, 
  Calendar, 
  MessageSquare, 
  FileText, 
  ChevronRight, 
  ExternalLink,
  Menu,
  X,
  HelpCircle,
  BarChart3,
  CheckCircle,
  Clock,
  FileSearch,
  AlertCircle,
  Smartphone,
  Globe,
  LucideIcon
} from "lucide-react";
import logoImage from "../assets/new-logo.jpg";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <Card className="border border-gray-100 hover:shadow-md transition-shadow h-full">
      <CardContent className="pt-6">
        <div className="rounded-full w-12 h-12 flex items-center justify-center bg-pink-100 mb-4">
          <Icon className="h-6 w-6 text-pink-500" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
}

interface StepCardProps {
  number: number;
  title: string;
  description: string;
}

function StepCard({ number, title, description }: StepCardProps) {
  return (
    <div className="relative pl-12 pb-8 border-l border-pink-200 last:border-0">
      <div className="absolute top-0 left-0 -translate-x-1/2 rounded-full w-8 h-8 bg-pink-500 flex items-center justify-center text-white font-bold">
        {number}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold flex items-center">
          <HelpCircle className="h-5 w-5 text-pink-500 mr-2" />
          {question}
        </h3>
        <p className="mt-2 text-gray-600">{answer}</p>
      </CardContent>
    </Card>
  );
}

interface UserGroupTabProps {
  active: boolean;
  title: string;
  icon: LucideIcon;
  onClick: () => void;
}

function UserGroupTab({ active, title, icon: Icon, onClick }: UserGroupTabProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-3 px-5 py-3 rounded-lg transition-colors ${
        active 
          ? "bg-pink-50 border border-pink-200" 
          : "bg-white border border-gray-200 hover:bg-gray-50"
      }`}
    >
      <div className={`rounded-full p-2 ${active ? "bg-pink-100" : "bg-gray-100"}`}>
        <Icon className={`h-5 w-5 ${active ? "text-pink-500" : "text-gray-500"}`} />
      </div>
      <span className={`font-medium ${active ? "text-pink-600" : "text-gray-700"}`}>{title}</span>
    </button>
  );
}

export default function LandingPage() {
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userGroup, setUserGroup] = useState<"individuals" | "providers" | "parents">("individuals");
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Skip to main content - Accessibility Feature */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-white focus:z-50 focus:text-pink-600">
        Skip to main content
      </a>
      
      {/* Header/Navigation */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="rounded-full bg-pink-50 p-1.5 shadow-sm">
                  <img src={logoImage} alt="Digital Pregnancy Passport Logo" className="h-8 w-auto opacity-95" />
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">Digital Pregnancy Passport</span>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
              <a href="#features" className="text-gray-700 hover:text-pink-500 px-3 py-2 rounded-md text-sm font-medium">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-700 hover:text-pink-500 px-3 py-2 rounded-md text-sm font-medium">
                How It Works
              </a>
              <a href="#faq" className="text-gray-700 hover:text-pink-500 px-3 py-2 rounded-md text-sm font-medium">
                FAQ
              </a>
              <a href="#privacy" className="text-gray-700 hover:text-pink-500 px-3 py-2 rounded-md text-sm font-medium">
                Privacy
              </a>
              <Button
                onClick={() => navigate("/auth-page")}
                variant="outline"
                size="sm"
                className="ml-4"
              >
                Sign In
              </Button>
              <Button
                onClick={() => navigate("/auth-page?tab=register")} 
                className="ml-2 bg-pink-500 hover:bg-pink-600"
              >
                Register
              </Button>
            </nav>
            
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-pink-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-500"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden border-b border-gray-200`}>
          <div className="pt-2 pb-3 space-y-1">
            <a
              href="#features"
              className="text-gray-700 hover:bg-gray-50 hover:text-pink-500 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-gray-700 hover:bg-gray-50 hover:text-pink-500 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </a>
            <a
              href="#faq"
              className="text-gray-700 hover:bg-gray-50 hover:text-pink-500 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              FAQ
            </a>
            <a
              href="#privacy"
              className="text-gray-700 hover:bg-gray-50 hover:text-pink-500 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Privacy
            </a>
            <div className="flex space-x-2 px-3 pt-2">
              <Button
                onClick={() => {
                  navigate("/auth-page");
                  setMobileMenuOpen(false);
                }}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Sign In
              </Button>
              <Button
                onClick={() => {
                  navigate("/auth-page?tab=register");
                  setMobileMenuOpen(false);
                }}
                className="flex-1 bg-pink-500 hover:bg-pink-600"
              >
                Register
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main id="main-content" className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-50 to-pink-50 py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between">
              <div className="md:max-w-2xl mb-8 md:mb-0">
                <div className="flex items-center justify-start mb-6">
                  <div className="rounded-full bg-gradient-to-r from-pink-50 to-white p-4 shadow-sm">
                    <img src={logoImage} alt="Digital Pregnancy Passport Logo" className="h-20 w-auto" />
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Digital Pregnancy Passport
                </h1>
                <p className="text-lg md:text-xl text-gray-700 mb-6">
                  A secure, comprehensive digital platform connecting patients and clinicians for better pregnancy care.
                </p>
                
                <div className="flex space-x-3 mb-8">
                  <div className="flex items-center">
                    <ShieldCheck className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-700">Secure &amp; Private</span>
                  </div>
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-700">24/7 Access</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-700">Easy to Use</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <Button 
                    onClick={() => navigate("/auth-page?tab=register")} 
                    size="lg" 
                    className="bg-pink-500 hover:bg-pink-600"
                  >
                    Register Now
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    onClick={() => navigate("/auth-page")} 
                    variant="outline" 
                    size="lg"
                  >
                    Sign In
                  </Button>
                </div>
              </div>
              
              <div className="md:w-2/5 flex justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1556766920-18d1adecb201?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80" 
                  alt="Mother and baby" 
                  className="rounded-lg shadow-lg max-w-full h-auto" 
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* User Group Tabs */}
        <section className="py-12 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Information For</h2>
              <p className="text-lg text-gray-600 mt-2">
                Choose your role to see tailored information
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <UserGroupTab 
                active={userGroup === "individuals"} 
                title="Expecting Parents" 
                icon={Heart} 
                onClick={() => setUserGroup("individuals")} 
              />
              <UserGroupTab 
                active={userGroup === "providers"} 
                title="Healthcare Providers" 
                icon={User} 
                onClick={() => setUserGroup("providers")} 
              />
              <UserGroupTab 
                active={userGroup === "parents"} 
                title="New Parents" 
                icon={Baby} 
                onClick={() => setUserGroup("parents")} 
              />
            </div>
            
            <div className="mt-8">
              {userGroup === "individuals" && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">For Expecting Parents</h3>
                  <p className="text-lg text-gray-700 mb-6">
                    The Digital Pregnancy Passport provides expecting parents with a comprehensive tool to manage 
                    your pregnancy journey. Track appointments, monitor health metrics, and stay connected with 
                    your healthcare team all in one secure place.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex">
                      <div className="mr-4 flex-shrink-0">
                        <Calendar className="h-6 w-6 text-pink-500" />
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">Appointment Tracking</h4>
                        <p className="mt-1 text-gray-600">Never miss an important check-up or scan.</p>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="mr-4 flex-shrink-0">
                        <FileSearch className="h-6 w-6 text-pink-500" />
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">Health Records</h4>
                        <p className="mt-1 text-gray-600">All your pregnancy health information in one place.</p>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="mr-4 flex-shrink-0">
                        <BookOpen className="h-6 w-6 text-pink-500" />
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">Educational Resources</h4>
                        <p className="mt-1 text-gray-600">Access trusted information at each stage of pregnancy.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {userGroup === "providers" && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">For Healthcare Providers</h3>
                  <p className="text-lg text-gray-700 mb-6">
                    Access comprehensive patient records, manage appointments efficiently, and provide better 
                    continuity of care with our secure digital platform designed specifically for prenatal care providers.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex">
                      <div className="mr-4 flex-shrink-0">
                        <FileText className="h-6 w-6 text-pink-500" />
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">Clinical Records</h4>
                        <p className="mt-1 text-gray-600">Complete patient history and pregnancy records.</p>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="mr-4 flex-shrink-0">
                        <AlertCircle className="h-6 w-6 text-pink-500" />
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">Clinical Decision Support</h4>
                        <p className="mt-1 text-gray-600">Evidence-based guidelines at your fingertips.</p>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="mr-4 flex-shrink-0">
                        <MessageSquare className="h-6 w-6 text-pink-500" />
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">Secure Messaging</h4>
                        <p className="mt-1 text-gray-600">Communicate securely with patients and colleagues.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {userGroup === "parents" && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">For New Parents</h3>
                  <p className="text-lg text-gray-700 mb-6">
                    Continue your journey after birth with access to your complete pregnancy history, 
                    postpartum care information, and resources for your newborn's health and development.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex">
                      <div className="mr-4 flex-shrink-0">
                        <FileText className="h-6 w-6 text-pink-500" />
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">Birth Records</h4>
                        <p className="mt-1 text-gray-600">Complete records of your pregnancy and birth experience.</p>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="mr-4 flex-shrink-0">
                        <Calendar className="h-6 w-6 text-pink-500" />
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">Postpartum Care</h4>
                        <p className="mt-1 text-gray-600">Track follow-up appointments and recovery milestones.</p>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="mr-4 flex-shrink-0">
                        <BookOpen className="h-6 w-6 text-pink-500" />
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">Newborn Care Resources</h4>
                        <p className="mt-1 text-gray-600">Access trusted information on caring for your newborn.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section id="features" className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Key Features</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Our digital pregnancy passport provides comprehensive tools to support your pregnancy journey from beginning to end.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={ShieldCheck}
                title="Secure Health Records"
                description="Keep all your pregnancy-related health information in one secure digital location, accessible anytime."
              />
              
              <FeatureCard 
                icon={Calendar}
                title="Appointment Management"
                description="Schedule, track, and receive reminders for all your prenatal appointments and check-ups."
              />
              
              <FeatureCard 
                icon={BarChart3}
                title="Health Tracking"
                description="Monitor vital health metrics throughout your pregnancy and share with healthcare providers."
              />
              
              <FeatureCard 
                icon={MessageSquare}
                title="Secure Messaging"
                description="Communicate directly with your healthcare team through our secure, HIPAA-compliant messaging system."
              />
              
              <FeatureCard 
                icon={BookOpen}
                title="Educational Resources"
                description="Access a library of evidence-based pregnancy and childbirth information tailored to your stage."
              />
              
              <FeatureCard 
                icon={FileText}
                title="Test Results & Scans"
                description="Store and view all your test results and ultrasound scans in one convenient location."
              />
              
              <FeatureCard 
                icon={Globe}
                title="Multilingual Support"
                description="Access the platform in multiple languages to better serve Australia's diverse population."
              />
              
              <FeatureCard 
                icon={Smartphone}
                title="Mobile Accessible"
                description="Access your pregnancy information anytime, anywhere from your smartphone or tablet."
              />
              
              <FeatureCard 
                icon={Clock}
                title="Pregnancy Timeline"
                description="Track your pregnancy journey with a personalized timeline of milestones and developments."
              />
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Getting started with the Digital Pregnancy Passport is simple and straightforward.
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <StepCard 
                number={1}
                title="Create Your Account"
                description="Register for a free account with your email address and create a secure password."
              />
              
              <StepCard 
                number={2}
                title="Set Up Your Profile"
                description="Enter your pregnancy details, including your due date and healthcare provider information."
              />
              
              <StepCard 
                number={3}
                title="Connect With Healthcare Providers"
                description="Invite your healthcare providers to connect with your digital passport for seamless information sharing."
              />
              
              <StepCard 
                number={4}
                title="Track Your Journey"
                description="Record appointments, test results, and monitor your health throughout your pregnancy."
              />
              
              <StepCard 
                number={5}
                title="Access Anytime, Anywhere"
                description="Log in securely from any device to view and update your pregnancy information when you need it."
              />
            </div>
            
            <div className="mt-12 text-center">
              <Button
                onClick={() => navigate("/auth-page?tab=register")}
                size="lg"
                className="bg-pink-500 hover:bg-pink-600"
              >
                Get Started Now
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
        
        {/* Privacy & Security Section */}
        <section id="privacy" className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pr-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Privacy & Security</h2>
                <p className="text-lg text-gray-700 mb-6">
                  We take the security and privacy of your health information extremely seriously. 
                  Our platform is built with multiple layers of protection to ensure your data remains safe.
                </p>
                
                <ul className="space-y-4">
                  <li className="flex">
                    <ShieldCheck className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">
                      <strong className="font-semibold">Bank-level encryption</strong> for all your personal health data
                    </span>
                  </li>
                  <li className="flex">
                    <ShieldCheck className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">
                      <strong className="font-semibold">Compliance with Australian Privacy Principles</strong> and healthcare regulations
                    </span>
                  </li>
                  <li className="flex">
                    <ShieldCheck className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">
                      <strong className="font-semibold">You control who can access</strong> your health information
                    </span>
                  </li>
                  <li className="flex">
                    <ShieldCheck className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">
                      <strong className="font-semibold">Regular security audits</strong> to ensure the highest level of protection
                    </span>
                  </li>
                  <li className="flex">
                    <ShieldCheck className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">
                      <strong className="font-semibold">Comprehensive activity logs</strong> that track all access to your information
                    </span>
                  </li>
                </ul>
                
                <div className="mt-8">
                  <Button variant="outline" className="flex items-center" onClick={() => window.open("#", "_blank")}>
                    Read our full Privacy Policy
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="md:w-1/2">
                <img 
                  src="https://images.unsplash.com/photo-1584931423298-c576fda54bd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                  alt="Data security concept" 
                  className="rounded-lg shadow-lg w-full"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section id="faq" className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-gray-600">
                Find answers to common questions about the Digital Pregnancy Passport
              </p>
            </div>
            
            <div className="space-y-4">
              <FAQItem 
                question="Is my health information secure?"
                answer="Yes, we use bank-level encryption and comply with all Australian privacy and healthcare regulations to keep your data safe and secure."
              />
              
              <FAQItem 
                question="Can I access my records after giving birth?"
                answer="Yes, your records will remain accessible even after your pregnancy. They can be valuable for future pregnancies or as part of your health history."
              />
              
              <FAQItem 
                question="How do I share information with my healthcare provider?"
                answer="Your healthcare provider can create an account and be linked to your record. You control what information they can see and for how long."
              />
              
              <FAQItem 
                question="Is the Digital Pregnancy Passport replacing paper records?"
                answer="While we aim to reduce reliance on paper records, we work alongside existing systems. Many healthcare providers will accept our digital records."
              />
              
              <FAQItem 
                question="What if I change healthcare providers during my pregnancy?"
                answer="You can easily add new healthcare providers to your account and manage their access permissions at any time."
              />
              
              <FAQItem 
                question="How much does it cost to use the Digital Pregnancy Passport?"
                answer="The basic Digital Pregnancy Passport is available at no cost to all Australian residents. Premium features may be available for a subscription fee."
              />
            </div>
            
            <div className="mt-12 text-center">
              <p className="text-gray-700 mb-4">Have more questions? We're here to help.</p>
              <Button variant="outline" className="flex items-center mx-auto">
                Contact our support team
                <MessageSquare className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
        
        {/* Testimonials and Stats */}
        <section className="py-16 bg-gradient-to-r from-primary-500 to-pink-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Digital Pregnancy Management</h2>
              <p className="text-xl opacity-90 max-w-3xl mx-auto">
                A comprehensive platform designed specifically for pregnancy health management.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-12">
              <div>
                <div className="text-4xl font-bold mb-2">Secure</div>
                <div className="text-lg opacity-90">Privacy-First Platform</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">Comprehensive</div>
                <div className="text-lg opacity-90">End-to-End Pregnancy Care</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">Accessible</div>
                <div className="text-lg opacity-90">Available Anytime, Anywhere</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center mt-12 space-y-4 sm:space-y-0 sm:space-x-4">
              <Button 
                onClick={() => navigate("/auth-page?tab=register")} 
                size="lg" 
                className="bg-white text-pink-600 hover:bg-gray-100"
              >
                Create Your Account
              </Button>
              <Button 
                onClick={() => navigate("/auth-page")} 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10"
              >
                Sign In
              </Button>
            </div>
          </div>
        </section>
        
        {/* Accessibility Banner */}
        <section className="py-8 bg-gray-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h3 className="text-xl font-semibold">Accessibility Options</h3>
                <p className="text-gray-300 mt-1">We're committed to making our service accessible to everyone</p>
              </div>
              
              <div className="flex space-x-4">
                <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                  Increase Text Size
                </Button>
                <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                  High Contrast
                </Button>
                <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                  Screen Reader Mode
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Digital Pregnancy Passport</h3>
              <p className="text-gray-400">
                Australia's first comprehensive digital platform for pregnancy health records.
              </p>
              <div className="mt-4 flex space-x-4">
                <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-pink-300">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-pink-300">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-pink-300">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-pink-300">Features</a></li>
                <li><a href="#how-it-works" className="text-gray-400 hover:text-pink-300">How It Works</a></li>
                <li><a href="#faq" className="text-gray-400 hover:text-pink-300">FAQ</a></li>
                <li><a href="#privacy" className="text-gray-400 hover:text-pink-300">Privacy & Security</a></li>
                <li><a href="#" className="text-gray-400 hover:text-pink-300">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-pink-300">Contact Us</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-pink-300">Pregnancy Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-pink-300">Health Guides</a></li>
                <li><a href="#" className="text-gray-400 hover:text-pink-300">Provider Directory</a></li>
                <li><a href="#" className="text-gray-400 hover:text-pink-300">Research & Studies</a></li>
                <li><a href="#" className="text-gray-400 hover:text-pink-300">Accessibility</a></li>
                <li><a href="#" className="text-gray-400 hover:text-pink-300">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-pink-300">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-pink-300">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-pink-300">Data Protection</a></li>
                <li><a href="#" className="text-gray-400 hover:text-pink-300">Cookie Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-pink-300">Disclaimer</a></li>
                <li><a href="#" className="text-gray-400 hover:text-pink-300">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between">
            <p className="text-gray-400">© 2025 Digital Pregnancy Passport. All rights reserved.</p>
            <div className="mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-pink-300 mr-4">Accessibility</a>
              <a href="#" className="text-gray-400 hover:text-pink-300 mr-4">Sitemap</a>
              <a href="#" className="text-gray-400 hover:text-pink-300">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}