export type EvolutionStage = {
  id: string
  label: string
  locked?: boolean
  active?: boolean
}

export type CodeLabHeaderData = {
  isLoggedIn: boolean
  username?: string
  xp: number
}

export type ProblemExample = {
  id: string
  input: string
  output: string
  explanation?: string
}

export type QuestionData = {
  title: string
  description: string
  examples: ProblemExample[]
  constraints: string[]
  followUp?: string
  markdownContent?: string
  complexityTarget?: {
    time: string
    space: string
  }
}

export type CodeEditorData = {
  fileBaseName: string
  defaultLanguageId: string
  languages: CodeLanguageOption[]
  codeTemplates: Record<string, string>
  runButtonLabel?: string
}

export type CodeLanguageOption = {
  id: string
  name: string
  extension: string
}

export type RunCodePayload = {
  code: string
  languageId: string
}

export type ConsoleLogType = 'log' | 'error' | 'success' | 'info'

export type ConsoleLog = {
  id: string
  type: ConsoleLogType
  message: string
  timestamp: string
}

export type ConsoleData = {
  title: string
  logs: ConsoleLog[]
}

export type MentorMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export type MentorData = {
  title: string
  subtitle: string
  initialMessages: MentorMessage[]
  hintSuggestions: string[]
  responseSuggestions: string[]
  hintButtonLabel: string
  inputPlaceholder: string
}
