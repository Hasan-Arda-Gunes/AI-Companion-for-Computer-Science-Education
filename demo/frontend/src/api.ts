// API service for Qwen LLM integration

const API_BASE_URL = 'http://localhost:12434'; // Docker model runner API endpoint

export interface ApiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface StreamChunk {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

/**
 * Send a code analysis request to the Qwen model with streaming response
 */
export async function analyzeCode(
  code: string,
  question: string,
  onChunk: (text: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): Promise<void> {
  const systemPrompt = `You are a Socratic Mentor for computer science education. Your role is to:

1. Analyze the student's code carefully
2. Identify any errors, bugs, or logical issues
3. Instead of giving direct answers, ask guiding questions that help students discover solutions themselves
4. Provide hints when needed, but encourage independent thinking
5. Celebrate correct solutions and suggest improvements for code quality, efficiency, or readability
6. Be encouraging and supportive, recognizing effort and progress

Always maintain a teaching mindset - your goal is to help students learn, not just to fix their code.`;

  const userPrompt = `Question: ${question}

Student's Code:
\`\`\`javascript
${code}
\`\`\`

Please analyze this code and provide feedback. If there are issues, help the student understand them through questions. If the code is correct, acknowledge it and suggest potential improvements.`;

  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen2.5',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        onComplete();
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      
      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          try {
            const chunk: StreamChunk = JSON.parse(line);
            if (chunk.message?.content) {
              onChunk(chunk.message.content);
            }
          } catch (e) {
            console.error('Error parsing chunk:', e);
          }
        }
      }
    }
  } catch (error) {
    onError(error instanceof Error ? error : new Error('Unknown error occurred'));
  }
}

/**
 * Send a chat message to the AI
 */
export async function sendChatMessage(
  messages: ApiMessage[],
  onChunk: (text: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen2.5',
        messages: messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        onComplete();
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          try {
            const chunk: StreamChunk = JSON.parse(line);
            if (chunk.message?.content) {
              onChunk(chunk.message.content);
            }
          } catch (e) {
            console.error('Error parsing chunk:', e);
          }
        }
      }
    }
  } catch (error) {
    onError(error instanceof Error ? error : new Error('Unknown error occurred'));
  }
}

/**
 * Check if the API is available
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tags`);
    return response.ok;
  } catch {
    return false;
  }
}
