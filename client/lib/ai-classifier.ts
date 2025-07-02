import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

const classificationSchema = z.object({
  classification: z.enum(["Productive", "Unproductive"]),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
})

export interface ClassificationResult {
  classification: "Productive" | "Unproductive"
  confidence: number
  reasoning: string
}

export async function classifyEmail(sender: string, subject: string, content: string): Promise<ClassificationResult> {
  try {
    const prompt = `
    Classify this email as either "Productive" or "Unproductive" based on its content and context.

    Productive emails are those that:
    - Contain work-related information, project updates, or business communications
    - Include meeting schedules, deadlines, or important announcements
    - Provide valuable information for decision-making or work progress
    - Come from colleagues, clients, or business contacts about legitimate work matters

    Unproductive emails are those that:
    - Are spam, promotional, or marketing emails
    - Contain irrelevant newsletters or subscriptions
    - Are social media notifications or non-work related content
    - Include jokes, memes, or casual personal conversations during work hours

    Email Details:
    Sender: ${sender}
    Subject: ${subject}
    Content: ${content.substring(0, 500)}...

    Provide a classification with confidence score and brief reasoning.
    `

    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: classificationSchema,
      prompt,
    })

    return result.object
  } catch (error) {
    console.error("AI Classification error:", error)

    // Fallback classification based on simple rules
    const isProductive = isEmailProductive(sender, subject, content)

    return {
      classification: isProductive ? "Productive" : "Unproductive",
      confidence: 0.6,
      reasoning: "Fallback classification based on keyword analysis",
    }
  }
}

// Fallback classification function
function isEmailProductive(sender: string, subject: string, content: string): boolean {
  const productiveKeywords = [
    "meeting",
    "project",
    "deadline",
    "update",
    "report",
    "schedule",
    "urgent",
    "important",
    "review",
    "approval",
    "task",
    "assignment",
    "client",
    "customer",
    "proposal",
    "contract",
    "budget",
    "planning",
  ]

  const unproductiveKeywords = [
    "unsubscribe",
    "promotion",
    "sale",
    "discount",
    "offer",
    "deal",
    "newsletter",
    "social",
    "notification",
    "spam",
    "advertisement",
    "marketing",
    "free",
    "win",
    "prize",
    "lottery",
    "congratulations",
  ]

  const text = `${sender} ${subject} ${content}`.toLowerCase()

  const productiveScore = productiveKeywords.reduce((score, keyword) => {
    return score + (text.includes(keyword) ? 1 : 0)
  }, 0)

  const unproductiveScore = unproductiveKeywords.reduce((score, keyword) => {
    return score + (text.includes(keyword) ? 1 : 0)
  }, 0)

  return productiveScore > unproductiveScore
}

export async function classifyMultipleEmails(
  emails: Array<{
    sender: string
    subject: string
    content: string
  }>,
): Promise<Array<ClassificationResult>> {
  const classifications = await Promise.all(
    emails.map((email) => classifyEmail(email.sender, email.subject, email.content)),
  )

  return classifications
}
