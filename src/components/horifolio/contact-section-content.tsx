"use client";

import { useState, type FC } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Github, Linkedin, Mail, Send, User, Phone, CheckCircle, Loader2 } from "lucide-react";

export const ContactSectionContent: FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [senderInfo, setSenderInfo] = useState({
    name: '',
    contact: '', // Can be email or phone
    contactType: 'email' as 'email' | 'phone'
  });
  const [isMessageSent, setIsMessageSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const quickTemplates = [
    {
      id: 'interview',
      title: 'Interview Invitation',
      subject: 'Interview Opportunity',
      body: 'Hi Ayush,\n\nWe are impressed with your portfolio and would like to invite you for an interview. Please let us know your availability.\n\nBest regards,'
    },
    {
      id: 'collaboration',
      title: 'Project Collaboration',
      subject: 'Collaboration Opportunity',
      body: 'Hello Ayush,\n\nWe have an exciting project opportunity and would love to discuss a potential collaboration with you.\n\nLooking forward to hearing from you,'
    },
    {
      id: 'freelance',
      title: 'Freelance Project',
      subject: 'Freelance Work Opportunity',
      body: 'Dear Ayush,\n\nWe came across your portfolio and are interested in hiring you for a freelance project. Would you be available for a quick discussion?\n\nBest,'
    },
    {
      id: 'networking',
      title: 'Professional Networking',
      subject: 'Professional Connection',
      body: 'Hi Ayush,\n\nI found your work very impressive and would love to connect and discuss potential opportunities in the future.\n\nRegards,'
    },
    {
      id: 'consultation',
      title: 'Technical Consultation',
      subject: 'Technical Consultation Request',
      body: 'Hello Ayush,\n\nWe need technical expertise for our project and would like to schedule a consultation with you.\n\nThank you,'
    }
  ];

  const handleTemplateSelect = async (template: typeof quickTemplates[0]) => {
    if (!senderInfo.name || !senderInfo.contact) {
      alert('Please provide your name and contact information first.');
      return;
    }

    setIsSending(true);

    const contactInfo = senderInfo.contactType === 'email' 
      ? `Email: ${senderInfo.contact}` 
      : `Phone: ${senderInfo.contact}`;
    
    const fullBody = `${template.body}\n\n${senderInfo.name}\n${contactInfo}`;
    
    // Send actual email using API endpoint
    try {
      const messageData = {
        to: 'ac228248@gmail.com',
        subject: template.subject,
        body: fullBody,
        sender: senderInfo,
        timestamp: new Date().toISOString(),
        templateUsed: template.id
      };

      // Send email via API endpoint
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send email');
      }

      const result = await response.json();
      console.log('Email sent successfully:', result);

      // Show success message
      setIsMessageSent(true);
      setIsSending(false);

      // Reset form after 5 seconds
      setTimeout(() => {
        setIsMessageSent(false);
        setSenderInfo({ name: '', contact: '', contactType: 'email' });
      }, 5000);

    } catch (error) {
      setIsSending(false);
      console.error('Error sending email:', error);
      alert(`Failed to send message: ${error instanceof Error ? error.message : 'Please try again.'}`);
    }
  };

  const handleDirectGmail = () => {
    const gmailUrl = `https://mail.google.com/mail/?view=cm&to=ac228248@gmail.com`;
    const newWindow = window.open(gmailUrl, '_blank');
    if (!newWindow) {
      alert('Please allow popups for this site to access Gmail.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSenderInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <>
      <p className="text-lg text-white/80 mb-8 max-w-xl">
        Ready to bring your ideas to life? Let's connect and create something amazing together.
      </p>
      
      {/* Social Icons - Enlarged */}
      <div className="flex items-center justify-center space-x-12 mb-12">
        <a 
          href="https://github.com/yourusername" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="group text-white/70 hover:text-white transition-all duration-300 hover:scale-110 transform" 
          aria-label="GitHub"
        >
          <div className="relative">
            <Github size={56} className="group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-300" />
            <div className="absolute -inset-3 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </a>
        <a 
          href="https://linkedin.com/in/yourprofile" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="group text-white/70 hover:text-blue-500 transition-all duration-300 hover:scale-110 transform" 
          aria-label="LinkedIn"
        >
          <div className="relative">
            <Linkedin size={56} className="group-hover:drop-shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-300" />
            <div className="absolute -inset-3 bg-blue-500/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </a>
        <button
          onClick={handleDirectGmail}
          className="group text-white/70 hover:text-red-400 transition-all duration-300 hover:scale-110 transform" 
          aria-label="Gmail"
        >
          <div className="relative">
            <Mail size={56} className="group-hover:drop-shadow-[0_0_10px_rgba(248,113,113,0.5)] transition-all duration-300" />
            <div className="absolute -inset-3 bg-red-400/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </button>
      </div>

      {/* Animated Separator Line */}
      <div className="relative flex items-center justify-center mb-12 py-8">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50"></div>
        </div>
        {/* Moving light effect */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <div className="h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent w-32 animate-slide-right"></div>
        </div>
        {/* Side pulses */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
          <div className="w-2 h-2 bg-blue-400/60 rounded-full animate-ping"></div>
        </div>
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
          <div className="w-2 h-2 bg-blue-400/60 rounded-full animate-ping animation-delay-1000"></div>
        </div>
      </div>

      {/* Quick Contact Section */}
      <div className="max-w-2xl mx-auto">
        {isMessageSent ? (
          /* Success Message */
          <div className="text-center py-12">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-green-400/20 rounded-full animate-pulse"></div>
              </div>
              <div className="relative z-10 flex flex-col items-center">
                <CheckCircle size={64} className="text-green-400 mb-6 animate-bounce" />
                <h3 className="text-2xl font-semibold text-white mb-4">Message Sent Successfully!</h3>
                <p className="text-lg text-green-400 mb-2">Will contact you soon</p>
                <p className="text-white/60 text-sm">Thank you for reaching out. I'll get back to you within 24 hours.</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-semibold text-white mb-6 text-center">
              Quick Contact Templates
            </h3>
            
            {/* Sender Information */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 mb-6 border border-white/10 hover:border-white/20 transition-colors duration-300">
              <h4 className="text-lg font-medium text-white mb-4 flex items-center">
                <User className="mr-2 text-blue-400" size={20} />
                Your Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white/80">Name *</Label>
                  <Input 
                    id="name" 
                    name="name"
                    placeholder="Your Full Name" 
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-blue-400/50 transition-colors"
                    value={senderInfo.name}
                    onChange={handleChange}
                    required
                    disabled={isSending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact" className="text-white/80">
                    {senderInfo.contactType === 'email' ? 'Email' : 'Phone'} *
                  </Label>
                  <div className="relative">
                    <Input 
                      id="contact" 
                      name="contact"
                      type={senderInfo.contactType === 'email' ? 'email' : 'tel'}
                      placeholder={senderInfo.contactType === 'email' ? 'your@email.com' : '+1234567890'}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-12 focus:border-blue-400/50 transition-colors"
                      value={senderInfo.contact}
                      onChange={handleChange}
                      required
                      disabled={isSending}
                    />
                    <button
                      type="button"
                      onClick={() => setSenderInfo(prev => ({
                        ...prev,
                        contactType: prev.contactType === 'email' ? 'phone' : 'email',
                        contact: ''
                      }))}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-blue-400 transition-colors p-1 rounded disabled:cursor-not-allowed"
                      title={`Switch to ${senderInfo.contactType === 'email' ? 'phone' : 'email'}`}
                      disabled={isSending}
                    >
                      {senderInfo.contactType === 'email' ? <Mail size={18} /> : <Phone size={18} />}
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-white/60 text-sm">
                <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                This information will be included in the email so I can contact you back.
              </p>
            </div>

            {/* Quick Templates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  disabled={isSending}
                  className="group relative bg-black/20 backdrop-blur-sm rounded-lg p-5 border border-white/10 hover:border-blue-400/50 transition-all duration-300 hover:bg-black/40 text-left overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-white group-hover:text-blue-400 transition-colors text-lg">
                        {template.title}
                      </h5>
                      {isSending ? (
                        <Loader2 size={18} className="text-blue-400 animate-spin" />
                      ) : (
                        <Send size={18} className="text-white/50 group-hover:text-blue-400 group-hover:transform group-hover:translate-x-1 transition-all duration-300" />
                      )}
                    </div>
                    <p className="text-white/60 text-sm line-clamp-2 group-hover:text-white/80 transition-colors leading-relaxed">
                      {template.body.split('\n')[0]}...
                    </p>
                  </div>
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </button>
              ))}
            </div>

            <div className="mt-6 text-center">
              <p className="text-white/60 text-sm mb-2">
                {isSending ? 'Sending your message...' : 'Click any template above to send a message instantly.'}
              </p>
              <p className="text-blue-400/80 text-xs">
                ⚡ Messages are sent directly - no redirects required!
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
};
