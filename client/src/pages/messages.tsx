import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Send, Search, User, UserRound, Info } from "lucide-react";
import { User as UserType, Message } from "@/types";

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch pregnancy data
  const { data: pregnancy } = useQuery({
    queryKey: ["/api/pregnancy"],
    enabled: !!user,
  });
  
  // Fetch available contacts (clinicians if patient, patients if clinician)
  const { data: contacts } = useQuery<UserType[]>({
    queryKey: ["/api/users", user?.role === "patient" ? "clinicians" : "patients"],
    queryFn: async () => {
      // This endpoint would need to be implemented in the backend
      const role = user?.role === "patient" ? "clinician" : "patient";
      const res = await fetch(`/api/users?role=${role}`);
      if (!res.ok) {
        // For demo purposes, return mock contacts
        return [
          {
            id: 101,
            username: "dr.emily",
            email: "emily@example.com",
            firstName: "Emily",
            lastName: "Chen",
            role: "clinician"
          },
          {
            id: 102,
            username: "midwife.jane",
            email: "jane@example.com",
            firstName: "Jane",
            lastName: "Smith",
            role: "clinician"
          }
        ] as UserType[];
      }
      return await res.json();
    },
    enabled: !!user,
  });
  
  // Fetch messages with selected user
  const { data: messages, isLoading: isLoadingMessages } = useQuery<Message[]>({
    queryKey: ["/api/messages", selectedUserId],
    queryFn: async () => {
      if (!selectedUserId || !pregnancy?.id) return [];
      
      try {
        const res = await fetch(`/api/messages?pregnancyId=${pregnancy.id}&otherUserId=${selectedUserId}`);
        if (!res.ok) throw new Error("Failed to fetch messages");
        return await res.json();
      } catch (error) {
        console.error("Error fetching messages:", error);
        return [];
      }
    },
    enabled: !!selectedUserId && !!pregnancy?.id,
    refetchInterval: 5000, // Poll for new messages every 5 seconds
  });
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { pregnancyId: number, toId: number, message: string }) => {
      const res = await apiRequest("POST", "/api/messages", messageData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedUserId] });
      setMessage("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const res = await apiRequest("POST", `/api/messages/${messageId}/read`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedUserId] });
    },
  });
  
  // Scroll to bottom of messages when new messages are loaded or sent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Auto-select first contact if none selected
  useEffect(() => {
    if (contacts?.length && !selectedUserId) {
      setSelectedUserId(contacts[0].id);
    }
  }, [contacts, selectedUserId]);
  
  // Mark received messages as read when viewed
  useEffect(() => {
    if (messages?.length && selectedUserId) {
      messages.forEach(msg => {
        if (msg.toId === user?.id && !msg.read) {
          markAsReadMutation.mutate(msg.id);
        }
      });
    }
  }, [messages, selectedUserId, user?.id]);
  
  const handleSendMessage = () => {
    if (!message.trim() || !selectedUserId || !pregnancy?.id) return;
    
    sendMessageMutation.mutate({
      pregnancyId: pregnancy.id,
      toId: selectedUserId,
      message: message.trim(),
    });
  };
  
  const filteredContacts = contacts?.filter(contact => 
    `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getSelectedContact = () => {
    return contacts?.find(contact => contact.id === selectedUserId);
  };
  
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header userName={user ? `${user.firstName} ${user.lastName}` : ""} />
      
      <div className="flex-grow flex">
        <Sidebar activePage="messages" userRole={user?.role || "patient"} />
        
        <div className="flex-1 overflow-hidden focus:outline-none pb-16 md:pb-0">
          <div className="max-w-7xl mx-auto h-full flex flex-col">
            <div className="px-4 sm:px-6 lg:px-8 py-6">
              <h1 className="text-2xl font-heading font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600 mt-1">
                Communicate with your healthcare providers securely
              </p>
            </div>
            
            {/* Chat Interface */}
            <div className="flex-grow flex-1 overflow-hidden flex flex-col md:flex-row">
              {/* Contacts Sidebar */}
              <div className="w-full md:w-80 border-r border-gray-200 bg-white">
                <div className="p-4 border-b border-gray-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search contacts"
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="overflow-y-auto h-[calc(100vh-14rem)]">
                  {filteredContacts?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No contacts found
                    </div>
                  ) : (
                    filteredContacts?.map(contact => (
                      <div
                        key={contact.id}
                        className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 ${
                          selectedUserId === contact.id ? "bg-primary-50" : ""
                        }`}
                        onClick={() => setSelectedUserId(contact.id)}
                      >
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarImage src="" />
                          <AvatarFallback>
                            {contact.firstName[0]}{contact.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-3 min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {contact.firstName} {contact.lastName}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {contact.role === "clinician" ? "Healthcare Provider" : "Patient"}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {/* Messages Area */}
              <div className="flex-1 flex flex-col h-[calc(100vh-14rem)]">
                {selectedUserId ? (
                  <>
                    {/* Chat Header */}
                    <div className="border-b border-gray-200 bg-white p-4 flex items-center">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {getSelectedContact()?.firstName[0]}{getSelectedContact()?.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <h2 className="text-sm font-medium text-gray-900">
                          {getSelectedContact()?.firstName} {getSelectedContact()?.lastName}
                        </h2>
                        <p className="text-xs text-gray-500">
                          {getSelectedContact()?.role === "clinician" ? "Healthcare Provider" : "Patient"}
                        </p>
                      </div>
                    </div>
                    
                    {/* Messages */}
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                      {isLoadingMessages ? (
                        <div className="text-center py-8">
                          <p>Loading messages...</p>
                        </div>
                      ) : messages?.length === 0 ? (
                        <div className="text-center py-8">
                          <Info className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500">No messages yet</p>
                          <p className="text-gray-500 text-sm">Send a message to start the conversation</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messages?.map(msg => (
                            <div
                              key={msg.id}
                              className={`flex ${msg.fromId === user?.id ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-[75%] ${msg.fromId === user?.id ? 'bg-primary-100 text-primary-900' : 'bg-white'} rounded-lg px-4 py-2 shadow-sm`}>
                                <div className="text-sm">{msg.message}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {formatMessageTime(msg.timestamp)}
                                  {msg.fromId === user?.id && (
                                    <span className="ml-2">
                                      {msg.read ? 'Read' : 'Delivered'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </div>
                    
                    {/* Message Input */}
                    <div className="border-t border-gray-200 bg-white p-4">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Type a message..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button 
                          onClick={handleSendMessage}
                          disabled={!message.trim() || sendMessageMutation.isPending}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-gray-50">
                    <Card className="w-96">
                      <CardContent className="pt-6 text-center">
                        <div className="mx-auto rounded-full bg-primary-50 p-3 w-fit mb-4">
                          {user?.role === "patient" ? (
                            <UserRound className="h-8 w-8 text-primary-500" />
                          ) : (
                            <User className="h-8 w-8 text-primary-500" />
                          )}
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
                        <p className="text-gray-500 mb-4">
                          {contacts?.length 
                            ? "Select a contact from the list to start messaging"
                            : "No contacts available. Please check back later."
                          }
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <MobileNavigation activePage="messages" />
    </div>
  );
}
