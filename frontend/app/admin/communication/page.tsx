"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { announcementService } from "@/lib/services/announcement-service"
import { supportTicketService } from "@/lib/services/support-ticket-service"
import { bulkNotificationService } from "@/lib/services/bulk-notification-service"
import type { 
  Announcement as TypeAnnouncement, 
  SupportTicket as TypeSupportTicket, 
  TicketStats, 
  TicketMessageData,
  TicketCreateData
} from "@/lib/types"
import { useRef } from "react"

// Type aliases with normalized values
type AnnouncementWithExtendedType = TypeAnnouncement & {
  startDate?: string;
  endDate?: string;
  displayLocation?: string;
};

// Normalize status values
type NormalizedTicket = Omit<TypeSupportTicket, 'status'> & {
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
};

export default function CommunicationToolsPage() {
  const { toast } = useToast()
  
  // Refs for form elements in create ticket modal
  const userEmailRef = useRef<HTMLInputElement>(null)
  const subjectRef = useRef<HTMLInputElement>(null)
  const categoryRef = useRef<HTMLSelectElement>(null)
  const messageRef = useRef<HTMLTextAreaElement>(null)
  
  // State for announcements
  const [announcements, setAnnouncements] = useState<AnnouncementWithExtendedType[]>([])
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(true)
  
  // State for support tickets
  const [tickets, setTickets] = useState<NormalizedTicket[]>([])
  const [ticketStats, setTicketStats] = useState<TicketStats>({
    open: 0,
    resolvedToday: 0,
    averageResponseTime: 0
  })
  const [ticketFilters, setTicketFilters] = useState({
    status: "all",
    category: "all",
    search: "",
    page: 1
  })
  const [isLoadingTickets, setIsLoadingTickets] = useState(true)
  
  // State for bulk notifications
  const [bulkNotificationForm, setBulkNotificationForm] = useState({
    recipientType: "all" as "all" | "providers" | "customers" | "inactive" | "custom",
    notificationType: "both" as "both" | "email" | "in-app",
    subject: "",
    message: ""
  })
  const [isSendingNotification, setIsSendingNotification] = useState(false)
  
  // State for modals
  const [showCreateAnnouncementModal, setShowCreateAnnouncementModal] = useState(false)
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false)
  const [showRespondTicketModal, setShowRespondTicketModal] = useState(false)
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [ticketResponse, setTicketResponse] = useState<TicketMessageData>({ 
    responseText: "", 
    status: "in-progress" 
  })
  
  // Form state for creating announcements
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    description: "", // Changed from message to description to match API
    type: "info" as "info" | "warning" | "critical", // Only include types accepted by the API
    startDate: "", // Added proper startDate
    endDate: "", // Changed from expiryDate to endDate to match API
    displayLocation: "all" // Added displayLocation
  })
  
  // Load announcements
  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const response = await announcementService.getAnnouncements();
        // Transform and normalize announcement data
        setAnnouncements(response.data as AnnouncementWithExtendedType[]);
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
        toast({
          title: "Error",
          description: "Failed to load announcements",
          variant: "destructive"
        });
      } finally {
        setIsLoadingAnnouncements(false);
      }
    }
    
    fetchAnnouncements();
  }, [toast]);
  
  // Load support tickets and stats
  useEffect(() => {
    async function fetchTicketsAndStats() {
      try {
        // Apply filters individually rather than passing the object
        const ticketsResponse = await supportTicketService.getTickets(
          ticketFilters.page,
          10, // Limit
          ticketFilters.status !== "all" ? ticketFilters.status : undefined,
          ticketFilters.category !== "all" ? ticketFilters.category : undefined,
          undefined, // priority
          ticketFilters.search || undefined
        );
        
        const statsResponse = await supportTicketService.getTicketStats();
        
        // Normalize status values to lowercase
        setTickets(ticketsResponse.data.map((ticket: any) => ({
          ...ticket,
          status: (ticket.status?.toLowerCase() || 'open') as 'open' | 'in-progress' | 'resolved' | 'closed'
        })));
        setTicketStats({
          // Access byStatus and map capitalized status to match TicketStats interface
          open: statsResponse.data.byStatus?.Open || 0,
          resolvedToday: statsResponse.data.resolvedToday || 0,
          averageResponseTime: statsResponse.data.averageResponseTime || 0
        });
      } catch (error) {
        console.error("Failed to fetch tickets or stats:", error);
        toast({
          title: "Error",
          description: "Failed to load support tickets",
          variant: "destructive"
        });
      } finally {
        setIsLoadingTickets(false);
      }
    }
    
    fetchTicketsAndStats();
  }, [ticketFilters, toast]);
  
  // Handle bulk notification submission
  const handleSendBulkNotification = async () => {
    if (!bulkNotificationForm.subject || !bulkNotificationForm.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setIsSendingNotification(true);
    
    try {
      await bulkNotificationService.createBulkNotification({
        recipientType: bulkNotificationForm.recipientType,
        notificationType: bulkNotificationForm.notificationType,
        title: bulkNotificationForm.subject, // Changed to match API
        content: bulkNotificationForm.message // Changed from message to content to match API
      });
      
      toast({
        title: "Success",
        description: "Bulk notification sent successfully",
        variant: "default"
      });
      
      // Reset form
      setBulkNotificationForm({
        recipientType: "all",
        notificationType: "both",
        subject: "",
        message: ""
      });
    } catch (error) {
      console.error("Failed to send bulk notification:", error);
      toast({
        title: "Error",
        description: "Failed to send bulk notification",
        variant: "destructive"
      });
    } finally {
      setIsSendingNotification(false);
    }
  };
  
  // Handle announcement creation
  const handleCreateAnnouncement = async () => {
    if (!announcementForm.title || !announcementForm.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const response = await announcementService.createAnnouncement({
        title: announcementForm.title,
        description: announcementForm.description,
        type: announcementForm.type, // Now correctly restricted to accepted types
        displayLocation: announcementForm.displayLocation,
        startDate: new Date(),
        endDate: announcementForm.endDate ? new Date(announcementForm.endDate) : undefined
      });
      
      // Transform and normalize the new announcement
      setAnnouncements([...announcements, response.data as AnnouncementWithExtendedType]);
      setShowCreateAnnouncementModal(false);
      
      toast({
        title: "Success",
        description: "Announcement created successfully",
        variant: "default"
      });
      
      // Reset form
      setAnnouncementForm({
        title: "",
        description: "",
        type: "info",
        startDate: "",
        endDate: "",
        displayLocation: "all"
      });
    } catch (error) {
      console.error("Failed to create announcement:", error);
      toast({
        title: "Error",
        description: "Failed to create announcement",
        variant: "destructive"
      });
    }
  };
  
  // Handle announcement deletion
  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await announcementService.deleteAnnouncement(id);
      setAnnouncements(announcements.filter(announcement => announcement._id !== id));
      
      toast({
        title: "Success",
        description: "Announcement deleted successfully",
        variant: "default"
      });
    } catch (error) {
      console.error("Failed to delete announcement:", error);
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive"
      });
    }
  };
  
  // Handle ticket filters change
  const handleTicketFilterChange = (filter: string, value: string | number) => {
    setTicketFilters({
      ...ticketFilters,
      [filter]: value,
      // Ensure page is always a number
      page: filter === 'page' ? Number(value) : 1 // Reset to first page when filters change
    });
  };
  
  // Handle responding to a ticket
  const handleRespondToTicket = async () => {
    if (!ticketResponse.responseText || !selectedTicketId) {
      toast({
        title: "Error",
        description: "Please enter a response",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Convert TicketMessageData to TicketResponseData format expected by API
      await supportTicketService.addTicketResponse(
        selectedTicketId, 
        {
          content: ticketResponse.responseText,
          status: ticketResponse.status
        } as { content: string; status: string }
      );
      
      // Refresh tickets with individual parameters
      const updatedTickets = await supportTicketService.getTickets(
        ticketFilters.page,
        10, // Limit
        ticketFilters.status !== "all" ? ticketFilters.status : undefined,
        ticketFilters.category !== "all" ? ticketFilters.category : undefined,
        undefined, // priority
        ticketFilters.search || undefined
      );
      
      // Normalize status values to lowercase
      setTickets(updatedTickets.data.map((ticket: any) => ({
        ...ticket,
        status: (ticket.status?.toLowerCase() || 'open') as 'open' | 'in-progress' | 'resolved' | 'closed'
      })));
      
      setShowRespondTicketModal(false);
      setSelectedTicketId(null);
      setTicketResponse({ responseText: "", status: "in-progress" });
      
      toast({
        title: "Success",
        description: "Response sent successfully",
        variant: "default"
      });
    } catch (error) {
      console.error("Failed to respond to ticket:", error);
      toast({
        title: "Error",
        description: "Failed to send response",
        variant: "destructive"
      });
    }
  };
  
  // Handle creating a new ticket
  const handleCreateTicket = async (ticketData: TicketCreateData) => {
    try {
      // Only pass properties that exist in TicketCreateData
      await supportTicketService.createTicket({
        ...ticketData,
        description: ticketData.message
        // Remove priority as it's not in TicketCreateData interface
      });
      
      // Refresh tickets with individual parameters
      const updatedTickets = await supportTicketService.getTickets(
        ticketFilters.page,
        10, // Limit
        ticketFilters.status !== "all" ? ticketFilters.status : undefined,
        ticketFilters.category !== "all" ? ticketFilters.category : undefined,
        undefined, // priority
        ticketFilters.search || undefined
      );
      
      // Normalize status values to lowercase
      setTickets(updatedTickets.data.map((ticket: any) => ({
        ...ticket,
        status: (ticket.status?.toLowerCase() || 'open') as 'open' | 'in-progress' | 'resolved' | 'closed'
      })));
      
      setShowCreateTicketModal(false);
      
      toast({
        title: "Success",
        description: "Ticket created successfully",
        variant: "default"
      });
    } catch (error) {
      console.error("Failed to create ticket:", error);
      toast({
        title: "Error",
        description: "Failed to create ticket",
        variant: "destructive"
      });
    }
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Communication Tools</h2>
        </div>
        
        {/* Bulk Notifications Section */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-2">Bulk Notifications</h3>
            <p className="text-sm text-muted-foreground mb-4">Send emails/app notifications to users</p>
            <div className="space-y-4 mb-4">
              <div className="space-y-2">
                <label htmlFor="recipient-type" className="text-sm font-medium">Recipient Type</label>
                <select 
                  id="recipient-type" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={bulkNotificationForm.recipientType}
                  onChange={(e) => setBulkNotificationForm({...bulkNotificationForm, recipientType: e.target.value as "all" | "providers" | "customers" | "inactive" | "custom"})}
                  disabled={isSendingNotification}
                >
                  <option value="all">All Users</option>
                  <option value="providers">Service Providers</option>
                  <option value="customers">Customers</option> {/* Changed from 'students' to 'customers' */}
                  <option value="inactive">Inactive Users</option>
                  <option value="custom">Custom Filter</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="notification-type" className="text-sm font-medium">Notification Type</label>
                <select 
                  id="notification-type" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={bulkNotificationForm.notificationType}
                  onChange={(e) => setBulkNotificationForm({...bulkNotificationForm, notificationType: e.target.value as "both" | "email" | "in-app"})}
                  disabled={isSendingNotification}
                >
                  <option value="both">Email + In-App</option>
                  <option value="email">Email Only</option>
                  <option value="in-app">In-App Only</option> {/* Changed from 'app' to 'in-app' */}
                </select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                <Input
                  id="subject"
                  value={bulkNotificationForm.subject}
                  onChange={(e) => setBulkNotificationForm({...bulkNotificationForm, subject: e.target.value})}
                  placeholder="Notification subject"
                  disabled={isSendingNotification}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">Message</label>
                <Textarea
                  id="message"
                  value={bulkNotificationForm.message}
                  onChange={(e) => setBulkNotificationForm({...bulkNotificationForm, message: e.target.value})}
                  placeholder="Enter notification message here..."
                  rows={3}
                  disabled={isSendingNotification}
                />
              </div>
            </div>
            
            <button 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4 w-full"
              onClick={handleSendBulkNotification}
              disabled={isSendingNotification}
            >
              {isSendingNotification ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Notification"
              )}
            </button>
          </div>
          
          {/* Announcement Banners Section */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-2">Announcement Banners</h3>
            <p className="text-sm text-muted-foreground mb-4">Display alerts on the platform</p>
            
            {isLoadingAnnouncements ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No active announcements
              </div>
            ) : (
              <div className="space-y-4 mb-4">
                {announcements.map((announcement) => (
                  <div key={announcement._id} className={`rounded-lg border p-4 ${
                    announcement.type === 'info' ? 'bg-blue-50' : 
                    announcement.type === 'warning' ? 'bg-amber-50' : 
                    'bg-red-50' // Using red for critical
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`text-sm font-medium ${
                          announcement.type === 'info' ? 'text-blue-800' : 
                          announcement.type === 'warning' ? 'text-amber-800' : 
                          'text-red-800' // Using red for critical
                        }`}>
                          {announcement.title}
                        </h4>
                        <p className={`text-xs mt-1 ${
                          announcement.type === 'info' ? 'text-blue-700' : 
                          announcement.type === 'warning' ? 'text-amber-700' : 
                          'text-red-700' // Using red for critical
                        }`}>
                          {announcement.endDate
                            ? `Displaying until ${new Date(announcement.endDate).toLocaleDateString()}`
                            : `Displaying on ${announcement.displayLocation || 'all pages'}`}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          className={`inline-flex items-center justify-center rounded-full w-6 h-6 ${
                            announcement.type === 'info' ? 'text-blue-700 bg-blue-100 hover:bg-blue-200' : 
                            announcement.type === 'warning' ? 'text-amber-700 bg-amber-100 hover:bg-amber-200' : 
                            'text-red-700 bg-red-100 hover:bg-red-200'
                          }`}
                          onClick={() => {
                            setAnnouncementForm({
                              title: announcement.title,
                              description: announcement.description,
                              // Map announcement type to a safe value
                              type: (announcement.type === 'info' || announcement.type === 'warning' || announcement.type === 'critical') 
                                ? announcement.type 
                                : 'info', // Default to info if not a valid type
                              startDate: announcement.startDate ? new Date(announcement.startDate).toISOString().split('T')[0] : '',
                              endDate: announcement.endDate ? new Date(announcement.endDate).toISOString().split('T')[0] : '',
                              displayLocation: announcement.displayLocation || 'all'
                            });
                            setShowCreateAnnouncementModal(true);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button 
                          className="inline-flex items-center justify-center rounded-full w-6 h-6 text-red-700 bg-red-100 hover:bg-red-200"
                          onClick={() => handleDeleteAnnouncement(announcement._id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <Dialog open={showCreateAnnouncementModal} onOpenChange={setShowCreateAnnouncementModal}>
              <DialogTrigger asChild>
                <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4 w-full">
                  Create New Banner
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Announcement Banner</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label htmlFor="banner-title" className="text-sm font-medium">Title</label>
                    <Input
                      id="banner-title"
                      value={announcementForm.title}
                      onChange={(e) => setAnnouncementForm({...announcementForm, title: e.target.value})}
                      placeholder="Announcement title"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="banner-description" className="text-sm font-medium">Description</label>
                    <Textarea
                      id="banner-description"
                      value={announcementForm.description}
                      onChange={(e) => setAnnouncementForm({...announcementForm, description: e.target.value})}
                      placeholder="Enter announcement description"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="banner-type" className="text-sm font-medium">Type</label>
                    <select 
                      id="banner-type" 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={announcementForm.type}
                      onChange={(e) => {
                        // Explicitly only allow valid types
                        const value = e.target.value;
                        if (value === 'info' || value === 'warning' || value === 'critical') {
                          setAnnouncementForm({...announcementForm, type: value});
                        }
                      }}
                    >
                      <option value="info">Information (Blue)</option>
                      <option value="warning">Warning (Amber)</option>
                      <option value="critical">Critical (Red)</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="banner-location" className="text-sm font-medium">Display Location</label>
                    <Input
                      id="banner-location"
                      value={announcementForm.displayLocation}
                      onChange={(e) => setAnnouncementForm({...announcementForm, displayLocation: e.target.value})}
                      placeholder="e.g., all, homepage, services"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="banner-end-date" className="text-sm font-medium">End Date (Optional)</label>
                    <Input
                      id="banner-end-date"
                      type="date"
                      value={announcementForm.endDate}
                      onChange={(e) => setAnnouncementForm({...announcementForm, endDate: e.target.value})}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-6">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setShowCreateAnnouncementModal(false);
                        setAnnouncementForm({
                          title: "",
                          description: "",
                          type: "info",
                          startDate: "",
                          endDate: "",
                          displayLocation: "all"
                        });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreateAnnouncement}>
                      Create Banner
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Support Ticket Analytics Section */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-2">Support Ticket Analytics</h3>
            <p className="text-sm text-muted-foreground mb-4">Overview of customer support performance</p>
            
            {isLoadingTickets ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Open Tickets</p>
                    <p className="text-2xl font-bold">{ticketStats.open}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Resolved Today</p>
                    <p className="text-2xl font-bold">{ticketStats.resolvedToday}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Response Time</p>
                    <p className="text-2xl font-bold">{ticketStats.averageResponseTime}h</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Support Ticket System Section */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Support Ticket System</h3>
            <p className="text-sm text-muted-foreground">Respond to user queries and issues</p>
          </div>
          
          <div className="p-6 border-b">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex gap-2">
                <select 
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={ticketFilters.status}
                  onChange={(e) => handleTicketFilterChange('status', e.target.value)}
                >
                  <option value="all">All Tickets</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                
                <select 
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={ticketFilters.category}
                  onChange={(e) => handleTicketFilterChange('category', e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="technical">Technical Issues</option>
                  <option value="billing">Billing</option>
                  <option value="account">Account</option>
                  <option value="service">Service Issues</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="flex gap-2">
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  <input 
                    type="text" 
                    placeholder="Search tickets..." 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                    value={ticketFilters.search}
                    onChange={(e) => handleTicketFilterChange('search', e.target.value)}
                  />
                </div>
                
                <button 
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
                  onClick={() => setShowCreateTicketModal(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Create Ticket
                </button>
              </div>
            </div>
          </div>
          
          {isLoadingTickets ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No tickets found matching your filters
            </div>
          ) : (
            <div className="p-0">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Ticket ID</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Subject</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">User</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Category</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Date</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Status</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {tickets.map((ticket) => (
                      <tr key={ticket._id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium">#{ticket.ticketId}</td>
                        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{ticket.subject}</td>
                        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{ticket.user.email}</td>
                        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{ticket.category}</td>
                        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent ${
                            ticket.status === 'open' ? 'bg-red-100 text-red-800 hover:bg-red-200/80' :
                            ticket.status === 'in-progress' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200/80' :
                            ticket.status === 'resolved' ? 'bg-green-100 text-green-800 hover:bg-green-200/80' :
                            'bg-gray-100 text-gray-800 hover:bg-gray-200/80'
                          }`}>
                            {ticket.status === 'open' ? 'Open' :
                             ticket.status === 'in-progress' ? 'In Progress' :
                             ticket.status === 'resolved' ? 'Resolved' : 'Closed'}
                          </span>
                        </td>
                        <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                          <button 
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                            onClick={() => {
                              setSelectedTicketId(ticket._id);
                              setShowRespondTicketModal(true);
                            }}
                          >
                            {(ticket.status === 'open' || ticket.status === 'in-progress')
                             ? 'Respond' : 'View'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div className="p-4 flex justify-center">
            <nav className="flex items-center space-x-1">
              <button 
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                onClick={() => handleTicketFilterChange('page', Math.max(1, ticketFilters.page - 1))}
                disabled={ticketFilters.page === 1}
              >
                Previous
              </button>
              {[1, 2, 3].map((page) => (
                <button 
                  key={page}
                  className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 ${
                    ticketFilters.page === page ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''
                  }`}
                  onClick={() => handleTicketFilterChange('page', page)}
                >
                  {page}
                </button>
              ))}
              <button 
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                onClick={() => handleTicketFilterChange('page', ticketFilters.page + 1)}
                disabled={tickets.length < 10}  // Assuming 10 items per page
              >
                Next
              </button>
            </nav>
          </div>
        </div>
        
        {/* Create Ticket Modal */}
        <Dialog open={showCreateTicketModal} onOpenChange={setShowCreateTicketModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <label htmlFor="create-ticket-user" className="text-sm font-medium">User Email</label>
                <Input
                  id="create-ticket-user"
                  placeholder="User email address"
                  ref={userEmailRef}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="create-ticket-subject" className="text-sm font-medium">Subject</label>
                <Input
                  id="create-ticket-subject"
                  placeholder="Ticket subject"
                  ref={subjectRef}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="create-ticket-category" className="text-sm font-medium">Category</label>
                <select 
                  id="create-ticket-category" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  ref={categoryRef}
                >
                  <option value="technical">Technical Issues</option>
                  <option value="billing">Billing</option>
                  <option value="account">Account</option>
                  <option value="service">Service Issues</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="create-ticket-message" className="text-sm font-medium">Message</label>
                <Textarea
                  id="create-ticket-message"
                  placeholder="Enter ticket details..."
                  rows={5}
                  ref={messageRef}
                />
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <Button 
                  variant="outline"
                  onClick={() => setShowCreateTicketModal(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => {
                  if (userEmailRef.current && subjectRef.current && categoryRef.current && messageRef.current) {
                    const ticketData: TicketCreateData = {
                      userEmail: userEmailRef.current.value,
                      subject: subjectRef.current.value,
                      category: categoryRef.current.value,
                      message: messageRef.current.value
                    };
                    handleCreateTicket(ticketData);
                  }
                }}>
                  Create Ticket
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Respond to Ticket Modal */}
        <Dialog open={showRespondTicketModal} onOpenChange={setShowRespondTicketModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Respond to Support Ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <label htmlFor="ticket-response" className="text-sm font-medium">Your Response</label>
                <Textarea
                  id="ticket-response"
                  placeholder="Enter your response to the ticket..."
                  rows={5}
                  value={ticketResponse.responseText}
                  onChange={(e) => setTicketResponse({...ticketResponse, responseText: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="ticket-status" className="text-sm font-medium">Update Status</label>
                <select 
                  id="ticket-status" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={ticketResponse.status}
                  onChange={(e) => setTicketResponse({...ticketResponse, status: e.target.value as "in-progress" | "resolved" | "closed"})}
                >
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowRespondTicketModal(false);
                    setSelectedTicketId(null);
                    setTicketResponse({ responseText: "", status: "in-progress" });
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleRespondToTicket}>
                  Submit Response
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}