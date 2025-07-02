"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Search, LogOut, Users, Mail, FileText, Brain, CheckCircle, AlertCircle } from "lucide-react"
import { processAndClassifyEmails, type ClassifiedEmail } from "@/app/actions/classify-emails"

export default function ClassificationPage() {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [emails, setEmails] = useState<ClassifiedEmail[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isClassifying, setIsClassifying] = useState(false)
  const [classificationProgress, setClassificationProgress] = useState(0)
  const [processingStatus, setProcessingStatus] = useState<string>("")
  const [error, setError] = useState<string>("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files)
    setError("")
  }

  const handleClassify = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      setError("Please select files to classify")
      return
    }

    setIsClassifying(true)
    setClassificationProgress(0)
    setProcessingStatus("Uploading files...")
    setError("")

    try {
      const formData = new FormData()
      Array.from(selectedFiles).forEach((file) => {
        formData.append("files", file)
      })

      setProcessingStatus("Parsing email content...")
      setClassificationProgress(25)

      const result = await processAndClassifyEmails(formData)

      if (!result.success) {
        setError(result.error || "Failed to process emails")
        return
      }

      setProcessingStatus("Classifying emails with AI...")
      setClassificationProgress(75)

      // Simulate processing time for better UX
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setEmails(result.emails || [])
      setClassificationProgress(100)
      setProcessingStatus(`Successfully classified ${result.totalProcessed} emails!`)

      // Clear status after 3 seconds
      setTimeout(() => {
        setProcessingStatus("")
        setClassificationProgress(0)
      }, 3000)
    } catch (error) {
      console.error("Classification error:", error)
      setError("An unexpected error occurred during classification")
    } finally {
      setIsClassifying(false)
    }
  }

  const filteredEmails = emails.filter(
    (email) =>
      email.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.classification.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const productiveEmails = emails.filter((email) => email.classification === "Productive")
  const unproductiveEmails = emails.filter((email) => email.classification === "Unproductive")

  const senderCounts = emails.reduce(
    (acc, email) => {
      acc[email.sender] = (acc[email.sender] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const topSender = Object.entries(senderCounts).sort(([, a], [, b]) => b - a)[0]
  const averageConfidence =
    emails.length > 0
      ? ((emails.reduce((sum, email) => sum + email.confidence, 0) / emails.length) * 100).toFixed(1)
      : "0"

  const handleLogout = () => {
    window.location.href = "/"
  }

  const navigateToUsers = () => {
    window.location.href = "/users"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header - keep existing */}
      <header className="bg-white shadow-sm border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-blue-900">AI Email Classification System</h1>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={navigateToUsers}
                className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
              >
                <Users className="h-4 w-4 mr-2" />
                User Accounts
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section with AI Features */}
        <Card className="mb-8 shadow-lg border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center">
              <Brain className="h-5 w-5 mr-2" />
              AI-Powered Email Classification
            </CardTitle>
            <CardDescription className="text-blue-600">
              Upload PDF or TXT files containing emails. Our AI will automatically classify them as Productive or
              Unproductive.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file-upload" className="text-blue-800">
                  Select Files (PDF, TXT)
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".pdf,.txt"
                  onChange={handleFileChange}
                  className="border-blue-200 focus:border-blue-400"
                />
                {selectedFiles && <p className="text-sm text-blue-600 mt-2">{selectedFiles.length} file(s) selected</p>}
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {isClassifying && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-blue-600">
                    <Brain className="h-4 w-4 animate-pulse" />
                    <span className="text-sm">{processingStatus}</span>
                  </div>
                  <Progress value={classificationProgress} className="w-full" />
                </div>
              )}

              {processingStatus && !isClassifying && (
                <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-md">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">{processingStatus}</span>
                </div>
              )}

              <Button
                onClick={handleClassify}
                disabled={!selectedFiles || isClassifying}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Brain className="h-4 w-4 mr-2" />
                {isClassifying ? "Classifying with AI..." : "Classify Emails with AI"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Statistics Cards */}
        {emails.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-lg border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">Total Classified</CardTitle>
                <Mail className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{emails.length}</div>
                <p className="text-xs text-blue-600">Emails processed</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">Productive Emails</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{productiveEmails.length}</div>
                <p className="text-xs text-green-600">
                  {emails.length > 0 ? Math.round((productiveEmails.length / emails.length) * 100) : 0}% of total
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">Unproductive Emails</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{unproductiveEmails.length}</div>
                <p className="text-xs text-red-600">
                  {emails.length > 0 ? Math.round((unproductiveEmails.length / emails.length) * 100) : 0}% of total
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-blue-200 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Confidence</CardTitle>
                <Brain className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageConfidence}%</div>
                <p className="text-xs opacity-90">Average accuracy</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Unified Results Table */}
        {emails.length > 0 && (
          <Card className="shadow-lg border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Classified Emails ({filteredEmails.length} of {emails.length})
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
                <Input
                  placeholder="Search emails by sender, subject, or classification..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-blue-200 focus:border-blue-400"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-50">
                      <TableHead className="text-blue-800">Sender</TableHead>
                      <TableHead className="text-blue-800">Subject</TableHead>
                      <TableHead className="text-blue-800">Classification</TableHead>
                      <TableHead className="text-blue-800">Confidence</TableHead>
                      <TableHead className="text-blue-800">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmails.map((email, index) => (
                      <TableRow key={email.id} className={index % 2 === 0 ? "bg-blue-25" : "bg-white"}>
                        <TableCell className="font-medium">{email.sender}</TableCell>
                        <TableCell className="max-w-xs truncate" title={email.subject}>
                          {email.subject}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              email.classification === "Productive"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-red-100 text-red-800 border-red-200"
                            }
                          >
                            {email.classification === "Productive" ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <AlertCircle className="h-3 w-3 mr-1" />
                            )}
                            {email.classification}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`${
                              email.confidence > 0.8
                                ? "bg-green-100 text-green-800"
                                : email.confidence > 0.6
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {Math.round(email.confidence * 100)}%
                          </Badge>
                        </TableCell>
                        <TableCell>{email.date}</TableCell>
                      </TableRow>
                    ))}
                    {filteredEmails.length === 0 && emails.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-blue-600">
                          No emails match your search criteria
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
