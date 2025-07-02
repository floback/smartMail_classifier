export interface ParsedEmail {
  sender: string
  subject: string
  content: string
  date: string
}

export async function parseTextFile(file: File): Promise<ParsedEmail[]> {
  const text = await file.text()
  const emails: ParsedEmail[] = []

  // Simple email parsing for TXT files
  // Look for common email patterns
  const emailBlocks = text.split(/(?=From:|Subject:|Date:)/i).filter((block) => block.trim())

  for (const block of emailBlocks) {
    const lines = block.split("\n")
    let sender = ""
    let subject = ""
    let date = ""
    let content = ""

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line.toLowerCase().startsWith("from:")) {
        sender = line.substring(5).trim()
      } else if (line.toLowerCase().startsWith("subject:")) {
        subject = line.substring(8).trim()
      } else if (line.toLowerCase().startsWith("date:")) {
        date = line.substring(5).trim()
      } else if (sender && subject && !line.toLowerCase().match(/^(from|subject|date|to|cc):/)) {
        content += line + " "
      }
    }

    if (sender && subject) {
      emails.push({
        sender: sender.replace(/[<>]/g, ""),
        subject,
        content: content.trim(),
        date: date || new Date().toISOString().split("T")[0],
      })
    }
  }

  return emails
}

export async function parsePDFFile(file: File): Promise<ParsedEmail[]> {
  // For PDF parsing, we'll simulate extraction since PDF parsing requires special libraries
  // In a real implementation, you'd use pdf-parse or similar
  const fileName = file.name

  // Simulate PDF content extraction
  return [
    {
      sender: "extracted@pdf.com",
      subject: `Email extracted from ${fileName}`,
      content: "This is simulated content extracted from PDF file. In production, use a proper PDF parsing library.",
      date: new Date().toISOString().split("T")[0],
    },
  ]
}
