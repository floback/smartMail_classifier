"use server"

import { parseTextFile, parsePDFFile, type ParsedEmail } from "@/lib/email-parser"
import { classifyMultipleEmails } from "@/lib/ai-classifier"

export interface ClassifiedEmail extends ParsedEmail {
  id: string
  classification: "Productive" | "Unproductive"
  confidence: number
  reasoning: string
}

export async function processAndClassifyEmails(formData: FormData) {
  try {
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return { success: false, error: "No files provided" }
    }

    const allEmails: ParsedEmail[] = []

    // Process each file
    for (const file of files) {
      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        const emails = await parseTextFile(file)
        allEmails.push(...emails)
      } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        const emails = await parsePDFFile(file)
        allEmails.push(...emails)
      }
    }

    if (allEmails.length === 0) {
      return { success: false, error: "No emails found in the uploaded files" }
    }

    // Classify emails using AI
    const classifications = await classifyMultipleEmails(allEmails)

    // Combine emails with their classifications
    const classifiedEmails: ClassifiedEmail[] = allEmails.map((email, index) => ({
      ...email,
      id: `email_${Date.now()}_${index}`,
      classification: classifications[index]?.classification || "Unproductive",
      confidence: classifications[index]?.confidence || 0.5,
      reasoning: classifications[index]?.reasoning || "Default classification",
    }))

    return {
      success: true,
      emails: classifiedEmails,
      totalProcessed: allEmails.length,
      productiveCount: classifiedEmails.filter((e) => e.classification === "Productive").length,
      unproductiveCount: classifiedEmails.filter((e) => e.classification === "Unproductive").length,
    }
  } catch (error) {
    console.error("Email processing error:", error)
    return {
      success: false,
      error: "Failed to process emails. Please try again.",
    }
  }
}
