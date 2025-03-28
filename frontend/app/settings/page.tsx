"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { PlusCircle, X, Calendar, Save, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { authService } from "@/lib/services/auth-service"
import { handleApiError, apiClient } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  const { user, token, updateUser, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Profile form state
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [phone, setPhone] = useState("")
  const [location, setLocation] = useState("")
  const [profileImage, setProfileImage] = useState("")
  
  // Skills state
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")
  
  // Education state
  const [educationList, setEducationList] = useState<{
    institution: string
    degree: string
    field: string
    from: Date
    to?: Date
    current: boolean
    description?: string
  }[]>([])
  
  // Certification state
  const [certifications, setCertifications] = useState<{
    name: string
    organization: string
    issueDate: Date
    expiryDate?: Date
    credentialId?: string
    credentialUrl?: string
  }[]>([])
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Loading states
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // New education form state
  const [newEducation, setNewEducation] = useState({
    institution: "",
    degree: "",
    field: "",
    from: new Date(),
    to: undefined as Date | undefined,
    current: false,
    description: ""
  })

  // New certification form state
  const [newCertification, setNewCertification] = useState({
    name: "",
    organization: "",
    issueDate: new Date(),
    expiryDate: undefined as Date | undefined,
    credentialId: "",
    credentialUrl: ""
  })
  
  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Preview the image
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
    
    setImageFile(file)
    setProfileImage("") // Clear any existing URL when a file is selected
  }

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/settings")
      return
    }

    if (user) {
      setName(user.name || "")
      setBio(user.bio || "")
      setPhone(user.phone || "")
      setLocation(user.address || "")
      setProfileImage(user.profileImage || "")
      
      // If there's a profile image URL, clear any local image preview
      if (user.profileImage) {
        setImagePreview(null)
      }
      
      setSkills(user.skills || [])
      setEducationList(user.education || [])
      setCertifications(user.certifications || [])
    }
  }, [user, authLoading, isAuthenticated, router])

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill("")
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove))
  }

  const handleAddEducation = () => {
    if (newEducation.institution && newEducation.degree && newEducation.field) {
      setEducationList([...educationList, { ...newEducation }])
      setNewEducation({
        institution: "",
        degree: "",
        field: "",
        from: new Date(),
        to: undefined,
        current: false,
        description: ""
      })
    }
  }

  const handleRemoveEducation = (index: number) => {
    setEducationList(educationList.filter((_, i) => i !== index))
  }

  const handleAddCertification = () => {
    if (newCertification.name && newCertification.organization) {
      setCertifications([...certifications, { ...newCertification }])
      setNewCertification({
        name: "",
        organization: "",
        issueDate: new Date(),
        expiryDate: undefined,
        credentialId: "",
        credentialUrl: ""
      })
    }
  }

  const handleRemoveCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index))
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) return

    try {
      setIsUpdatingProfile(true)

      // Upload image file if selected
      let imageUrl = profileImage
      if (imageFile) {
        const formData = new FormData()
        formData.append("file", imageFile)
        
        try {
          // Handle token type with explicit casting
          const options = token ? { token: token as string } : {}
          const response = await apiClient.upload("/upload/file", formData, options) as { 
            success: boolean; 
            data: { url: string } 
          }
          
          if (response?.success && response?.data?.url) {
            imageUrl = response.data.url
          }
        } catch (error) {
          console.error("Error uploading profile image:", error)
          toast({
            title: "Error",
            description: "Failed to upload profile image. Profile will be updated with existing image.",
            variant: "destructive",
          })
        }
      }

      const updatedData = {
        name,
        bio,
        phone,
        address: location,
        profileImage: imageUrl,
        skills,
        education: educationList,
        certifications
      }
      
      // Reset image file state after successful upload
      setImageFile(null)
      const response = await authService.updateProfile(updatedData, token)

      // Update the user in context
      updateUser(response.data)

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      handleApiError(error, "Failed to update profile")
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) return

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirm password must match.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsChangingPassword(true)

      await authService.changePassword({ currentPassword, newPassword }, token)

      // Reset form
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      toast({
        title: "Password changed",
        description: "Your password has been changed successfully.",
      })
    } catch (error) {
      handleApiError(error, "Failed to change password")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const formatDate = (date: Date) => {
    return date ? new Date(date).toISOString().split('T')[0] : ''
  }

  if (authLoading) {
    return (
      <div className="container py-8">
        <div className="space-y-6">
          <div className="h-8 w-64 bg-muted animate-pulse rounded"></div>
          <div className="h-40 bg-muted animate-pulse rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="skills">Skills & Education</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <Card>
              <form onSubmit={handleUpdateProfile}>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your profile information and how others see you on the platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={imagePreview || profileImage} alt={name} />
                      <AvatarFallback className="text-2xl">
                        {name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2 w-full max-w-md">
                      <Label>Profile Image</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          id="profile-image-upload"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          Upload Image
                        </Button>
                        <Input
                          placeholder="Or enter image URL"
                          value={profileImage}
                          onChange={(e) => {
                            setProfileImage(e.target.value)
                            setImageFile(null)
                            setImagePreview(null)
                          }}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="+254 700 000000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="Eldoret, Kenya"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isUpdatingProfile}>
                    {isUpdatingProfile ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="mt-6">
            <Card>
              <form onSubmit={handleUpdateProfile}>
                <CardHeader>
                  <CardTitle>Skills & Education</CardTitle>
                  <CardDescription>
                    Add your skills, education, and certifications to showcase your expertise
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Skills Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Skills</h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {skill}
                          <button 
                            type="button" 
                            onClick={() => handleRemoveSkill(skill)}
                            className="ml-1 rounded-full hover:bg-muted p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a skill (e.g., Web Development)"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="button" onClick={handleAddSkill} size="sm">
                        <PlusCircle className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Education Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Education</h3>
                    
                    {educationList.length > 0 && (
                      <div className="space-y-4 mb-4">
                        {educationList.map((edu, index) => (
                          <div key={index} className="border rounded-md p-4 relative">
                            <button 
                              type="button" 
                              onClick={() => handleRemoveEducation(index)}
                              className="absolute top-2 right-2 rounded-full hover:bg-muted p-1"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <div className="font-medium">{edu.institution}</div>
                            <div>{edu.degree} in {edu.field}</div>
                            <div className="text-sm text-muted-foreground flex items-center mt-1">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(edu.from)} - {edu.current ? 'Present' : edu.to ? formatDate(edu.to) : ''}
                            </div>
                            {edu.description && <div className="mt-2 text-sm">{edu.description}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="border rounded-md p-4 space-y-4">
                      <h4 className="font-medium">Add Education</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="institution">Institution</Label>
                          <Input
                            id="institution"
                            placeholder="University of Eldoret"
                            value={newEducation.institution}
                            onChange={(e) => setNewEducation({...newEducation, institution: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="degree">Degree</Label>
                          <Input
                            id="degree"
                            placeholder="Bachelor's"
                            value={newEducation.degree}
                            onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="field">Field of Study</Label>
                        <Input
                          id="field"
                          placeholder="Computer Science"
                          value={newEducation.field}
                          onChange={(e) => setNewEducation({...newEducation, field: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fromDate">From Date</Label>
                          <Input
                            id="fromDate"
                            type="date"
                            value={formatDate(newEducation.from)}
                            onChange={(e) => setNewEducation({
                              ...newEducation, 
                              from: e.target.value ? new Date(e.target.value) : new Date()
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="toDate">To Date</Label>
                          <Input
                            id="toDate"
                            type="date"
                            value={newEducation.to ? formatDate(newEducation.to) : ''}
                            onChange={(e) => setNewEducation({
                              ...newEducation, 
                              to: e.target.value ? new Date(e.target.value) : undefined
                            })}
                            disabled={newEducation.current}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="current"
                          checked={newEducation.current}
                          onChange={(e) => setNewEducation({...newEducation, current: e.target.checked})}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="current">I am currently studying here</Label>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                          id="description"
                          placeholder="Additional details about your education"
                          value={newEducation.description}
                          onChange={(e) => setNewEducation({...newEducation, description: e.target.value})}
                          rows={2}
                        />
                      </div>
                      <Button type="button" onClick={handleAddEducation} className="w-full">
                        <PlusCircle className="h-4 w-4 mr-1" /> Add Education
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Certifications Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Certifications</h3>
                    
                    {certifications.length > 0 && (
                      <div className="space-y-4 mb-4">
                        {certifications.map((cert, index) => (
                          <div key={index} className="border rounded-md p-4 relative">
                            <button 
                              type="button" 
                              onClick={() => handleRemoveCertification(index)}
                              className="absolute top-2 right-2 rounded-full hover:bg-muted p-1"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <div className="font-medium">{cert.name}</div>
                            <div className="text-sm">Issued by {cert.organization}</div>
                            <div className="text-sm text-muted-foreground flex items-center mt-1">
                              <Calendar className="h-3 w-3 mr-1" />
                              Issued: {formatDate(cert.issueDate)}
                              {cert.expiryDate && ` - Expires: ${formatDate(cert.expiryDate)}`}
                            </div>
                            {cert.credentialId && (
                              <div className="text-sm mt-1">Credential ID: {cert.credentialId}</div>
                            )}
                            {cert.credentialUrl && (
                              <div className="text-sm mt-1">
                                <a 
                                  href={cert.credentialUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  View Credential
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="border rounded-md p-4 space-y-4">
                      <h4 className="font-medium">Add Certification</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="certName">Certification Name</Label>
                          <Input
                            id="certName"
                            placeholder="AWS Certified Developer"
                            value={newCertification.name}
                            onChange={(e) => setNewCertification({...newCertification, name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="organization">Issuing Organization</Label>
                          <Input
                            id="organization"
                            placeholder="Amazon Web Services"
                            value={newCertification.organization}
                            onChange={(e) => setNewCertification({...newCertification, organization: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="issueDate">Issue Date</Label>
                          <Input
                            id="issueDate"
                            type="date"
                            value={formatDate(newCertification.issueDate)}
                            onChange={(e) => setNewCertification({
                              ...newCertification, 
                              issueDate: e.target.value ? new Date(e.target.value) : new Date()
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                          <Input
                            id="expiryDate"
                            type="date"
                            value={newCertification.expiryDate ? formatDate(newCertification.expiryDate) : ''}
                            onChange={(e) => setNewCertification({
                              ...newCertification, 
                              expiryDate: e.target.value ? new Date(e.target.value) : undefined
                            })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="credentialId">Credential ID (Optional)</Label>
                          <Input
                            id="credentialId"
                            placeholder="ABC123XYZ"
                            value={newCertification.credentialId}
                            onChange={(e) => setNewCertification({...newCertification, credentialId: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="credentialUrl">Credential URL (Optional)</Label>
                          <Input
                            id="credentialUrl"
                            placeholder="https://example.com/verify/ABC123XYZ"
                            value={newCertification.credentialUrl}
                            onChange={(e) => setNewCertification({...newCertification, credentialUrl: e.target.value})}
                          />
                        </div>
                      </div>
                      <Button type="button" onClick={handleAddCertification} className="w-full">
                        <PlusCircle className="h-4 w-4 mr-1" /> Add Certification
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isUpdatingProfile}>
                    {isUpdatingProfile ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save All Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="password" className="mt-6">
            <Card>
              <form onSubmit={handleChangePassword}>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your password to keep your account secure</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isChangingPassword}>
                    {isChangingPassword ? "Changing..." : "Change Password"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive notifications from the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Notification settings will be available soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}