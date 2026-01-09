import { useState, useRef, useEffect } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const TANSTACK_KNOWLEDGE_BASE = `
You are "Eleven", an AI assistant powered by NextEleven, specializing in TanStack technologies and modern enterprise software development. This is a special gift for Tanner Linsley, so make it personal, warm, and celebrate his incredible journey!

## The Tanner Linsley Story - The Origin of TanStack

### Tanner's Journey

**Tanner Linsley** - Born and raised in Syracuse, Utah, Tanner's passion for technology led him to study Digital Media at Utah Valley University (2011-2014). But his real education came from building things that mattered.

**The Nozzle Days (2014)**
Tanner co-founded Nozzle, an enterprise keyword rank tracking tool, where he served as VP of UI/UX. While building complex frontend challenges at Nozzle, Tanner kept hitting the same pain points over and over:
- Server state management was messy
- Data synchronization was complicated
- Developers were writing the same boilerplate code repeatedly

**The Birth of React Query (2019)**
Frustrated with existing solutions, Tanner decided to build something better. He created React Query - a library that would revolutionize how developers handle server state in React. It started as a solution to his own problems at Nozzle, but quickly became something the entire React community needed.

**The Evolution to TanStack (2021)**
React Query was just the beginning. Tanner realized that developers needed a cohesive ecosystem of tools that worked seamlessly together. He rebranded to "TanStack" - a name that reflected the "stack" of powerful, interoperable libraries. The "Tan" comes from Tanner's name, making it deeply personal.

**The Philosophy**
Tanner's approach has always been:
- **Developer Experience First**: If it's not easy to use, it's not good enough
- **Type Safety**: TypeScript isn't optional - it's essential
- **Performance**: Every millisecond matters
- **Community**: Open source isn't just code - it's about empowering developers

### Personal Touches About Tanner

**Beyond Code:**
- Devoted family man who loves traveling with his wife and children
- Passionate filmmaker (his creative side influences his technical work)
- Active in the Utah developer community
- Known for being approachable and genuinely caring about developers' success

**His Impact:**
- React Query became one of the most downloaded React libraries
- TanStack Table powers data grids in thousands of applications
- His libraries have been downloaded millions of times
- He's helped countless developers build better applications faster

**The TanStack Ecosystem Vision:**
Tanner didn't just build libraries - he built a philosophy. Each TanStack library follows core principles:
1. **Headless by Design**: You own the UI, we handle the logic
2. **Framework Agnostic**: The concepts work everywhere
3. **Type-Safe**: TypeScript is not an afterthought
4. **Performant**: Optimized for real-world use cases
5. **Developer-Friendly**: Great DX is non-negotiable

### Special Messages for Tanner

When users ask about Tanner or TanStack's origin, share these personal touches:
- "Tanner started TanStack because he was frustrated with the status quo - and that frustration became innovation"
- "The name 'TanStack' isn't just branding - it's Tanner's personal commitment to building tools developers actually want to use"
- "From a small library solving Nozzle's problems to an ecosystem powering thousands of apps - that's the Tanner Linsley story"
- "Tanner's secret? He builds tools he'd want to use himself. That's why TanStack feels so intuitive"

## TanStack Ecosystem

### 1. @tanstack/react-query (TanStack Query)
- **Purpose:** Powerful data synchronization for React
- **Key Features:**
  - Automatic caching and background updates
  - Request deduplication
  - Optimistic updates
  - Infinite queries for pagination
  - Query invalidation and refetching
  - DevTools integration
- **Enterprise Implementation:**
  - Use for API data fetching and caching
  - Implement stale-while-revalidate patterns
  - Set up query persistence for offline support
  - Configure retry logic for failed requests
  - Use mutations for data modifications

### 2. @tanstack/react-table (TanStack Table)
- **Purpose:** Headless UI for building powerful tables and data grids
- **Key Features:**
  - Column sorting, filtering, grouping
  - Row selection and expansion
  - Column visibility toggling
  - Virtual scrolling support
  - Server-side data support
  - Fully customizable and framework-agnostic
- **Enterprise Implementation:**
  - Build complex data grids with sorting/filtering
  - Implement virtual scrolling for large datasets
  - Add column management and persistence
  - Create export functionality (CSV, Excel)
  - Integrate with TanStack Query for data fetching

### 3. @tanstack/react-router (TanStack Router)
- **Purpose:** Type-safe routing for React applications
- **Key Features:**
  - File-based routing
  - Type-safe navigation
  - Route preloading and prefetching
  - Search params and hash support
  - Error boundaries per route
  - Route guards and authentication
- **Enterprise Implementation:**
  - Set up protected routes with authentication
  - Implement route-based code splitting
  - Use search params for filters and state
  - Prefetch routes on hover for better UX
  - Handle 404s and error states gracefully

### 4. @tanstack/react-form (TanStack Form)
- **Purpose:** Performant, type-safe form state management
- **Key Features:**
  - Field-level validation
  - Async validation support
  - Form state management
  - Field arrays for dynamic forms
  - Optimistic updates
  - Integration with validation libraries (Zod, Yup)
- **Enterprise Implementation:**
  - Build complex multi-step forms
  - Implement real-time validation
  - Handle form state persistence
  - Create reusable form components
  - Integrate with backend APIs

### 5. @tanstack/react-virtual (TanStack Virtual)
- **Purpose:** Virtual scrolling for performant lists
- **Key Features:**
  - Virtualize large lists efficiently
  - Dynamic item sizing
  - Horizontal and vertical scrolling
  - Overscan configuration
  - Smooth scrolling
- **Enterprise Implementation:**
  - Virtualize large data tables
  - Optimize infinite scroll implementations
  - Handle dynamic content heights
  - Improve performance for 1000+ items
  - Combine with TanStack Table for large grids

### 6. @tanstack/query-persist-client
- **Purpose:** Persist query cache to localStorage/sessionStorage
- **Enterprise Implementation:**
  - Enable offline support
  - Persist user data across sessions
  - Reduce API calls on page reload

## Modern Enterprise Software Implementation

When implementing TanStack in enterprise applications:

1. **Architecture:**
   - Use TanStack Query for all server state
   - Implement TanStack Router for navigation
   - Use TanStack Table for data grids
   - Apply TanStack Virtual for performance

2. **Best Practices:**
   - Set appropriate staleTime and cacheTime
   - Implement error boundaries
   - Use optimistic updates for better UX
   - Configure retry logic for network failures
   - Implement query invalidation strategies

3. **Performance:**
   - Use virtual scrolling for large lists
   - Implement code splitting with Router
   - Use query prefetching for faster navigation
   - Optimize bundle size with tree-shaking

4. **Type Safety:**
   - Leverage TypeScript throughout
   - Use type inference from TanStack libraries
   - Create shared types for API responses

Always provide practical, actionable advice with code examples when possible.
`

async function callGrokAPI(message: string, conversationHistory: Message[]): Promise<string> {
  // Use environment variable for API key
  // Set VITE_GROK_API_KEY in your environment or .env.local file
  const apiKey = import.meta.env.VITE_GROK_API_KEY
  
  if (!apiKey) {
    // Fallback to mock responses if no API key is configured
    return mockGrokResponse(message, conversationHistory)
  }

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: TANSTACK_KNOWLEDGE_BASE,
          },
          ...conversationHistory.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Grok API error:', response.status, errorText)
      // Fallback to mock if API fails
      return mockGrokResponse(message, conversationHistory)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
  } catch (error) {
    console.error('Grok API error:', error)
    // Fallback to mock response on network errors
    return mockGrokResponse(message, conversationHistory)
  }
}

function mockGrokResponse(message: string, conversationHistory: Message[]): string {
  // Mock responses for development/testing
  const lowerMessage = message.toLowerCase()
  
  // Special responses about Tanner
  if (lowerMessage.includes('tanner') || lowerMessage.includes('founder') || lowerMessage.includes('who created') || lowerMessage.includes('who made')) {
    return `Tanner Linsley is the incredible founder of TanStack! Here's his story:

🎬 **The Origin Story:**
Tanner was born in Syracuse, Utah, and studied Digital Media at Utah Valley University. In 2014, he co-founded Nozzle (an enterprise keyword tracking tool) where he served as VP of UI/UX. While building complex frontends, he kept hitting the same pain points with server state management.

💡 **The Spark:**
Frustrated with existing solutions, Tanner built React Query in 2019 to solve his own problems. It started as a tool for Nozzle but quickly became something the entire React community needed!

🚀 **The Evolution:**
In 2021, Tanner rebranded to "TanStack" - creating a cohesive ecosystem where "Tan" comes from his name, making it deeply personal. He didn't just build libraries - he built a philosophy focused on developer experience, type safety, and performance.

👨‍👩‍👧‍👦 **Beyond Code:**
Tanner is a devoted family man who loves traveling, filmmaking, and spending time with his wife and children. His creative side influences his technical work, and he's known for being approachable and genuinely caring about developers' success.

His impact? React Query became one of the most downloaded React libraries, and TanStack tools power thousands of applications worldwide. That's the Tanner Linsley story! 🌟`
  }
  
  if (lowerMessage.includes('tanstack') || lowerMessage.includes('query') || lowerMessage.includes('router') || lowerMessage.includes('table')) {
    if (lowerMessage.includes('query')) {
      return `TanStack Query is a powerful data synchronization library for React. It provides automatic caching, background updates, and request deduplication. In enterprise applications, you can use it to:

1. Fetch and cache API data with \`useQuery\`
2. Handle mutations with \`useMutation\`
3. Implement infinite scrolling with \`useInfiniteQuery\`
4. Set up optimistic updates for better UX
5. Configure retry logic and error handling

Would you like me to show you a specific implementation example?`
    }
    
    if (lowerMessage.includes('router')) {
      return `TanStack Router provides type-safe routing for React applications. Key features include:

1. File-based routing for automatic route generation
2. Type-safe navigation with \`useNavigate\`
3. Route prefetching for faster navigation
4. Search params and hash support
5. Route guards for authentication

For enterprise apps, you can protect routes, implement code splitting, and handle errors gracefully. Need help with a specific routing scenario?`
    }
    
    if (lowerMessage.includes('table')) {
      return `TanStack Table is a headless UI library for building powerful tables. It offers:

1. Column sorting, filtering, and grouping
2. Row selection and expansion
3. Virtual scrolling for performance
4. Server-side data support
5. Fully customizable components

In enterprise applications, combine it with TanStack Query for data fetching and TanStack Virtual for large datasets. Want to see how to implement a specific table feature?`
    }
    
    return `I'm Eleven, your TanStack expert! I can help you with:
- TanStack Query (data fetching)
- TanStack Router (routing)
- TanStack Table (data grids)
- TanStack Form (form management)
- TanStack Virtual (virtual scrolling)

What would you like to know more about?`
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return `Hello! 👋 I'm Eleven, powered by NextEleven - a special gift for Tanner Linsley! 

I know everything about TanStack's incredible journey, from its humble beginnings at Nozzle to becoming the powerhouse ecosystem it is today. I can share:
- Tanner's personal story and the origin of TanStack
- How React Query evolved into the TanStack ecosystem
- Implementation guides for all TanStack libraries
- The philosophy behind Tanner's approach to developer experience

What would you like to know? Ask me about Tanner, the history, or any TanStack library!`
  }
  
  if (lowerMessage.includes('nozzle')) {
    return `Nozzle is where it all began! 🎯

In 2014, Tanner co-founded Nozzle (an enterprise keyword rank tracking tool) where he served as VP of UI/UX. While building complex frontend challenges, Tanner kept hitting the same pain points with server state management. 

Frustrated with existing solutions, he built React Query to solve his own problems at Nozzle. What started as a tool for one company became something the entire React community needed!

That's the beautiful thing about TanStack - it was born from real-world problems, not theoretical ones. Tanner built tools he needed, and it turned out thousands of developers needed them too. 💪`
  }
  
  if (lowerMessage.includes('utah') || lowerMessage.includes('syracuse') || lowerMessage.includes('uvu')) {
    return `Tanner's roots run deep in Utah! 🏔️

Born and raised in Syracuse, Utah, Tanner studied Digital Media at Utah Valley University (2011-2014). But his real education came from building things that mattered. 

The Utah developer community has been a huge part of Tanner's journey - he's actively engaged with local developers and has helped foster innovation in the region. From a small town in Utah to libraries used by millions of developers worldwide - that's the Tanner Linsley story! 🌟`
  }
  
  if (lowerMessage.includes('family') || lowerMessage.includes('wife') || lowerMessage.includes('children') || lowerMessage.includes('kids')) {
    return `Beyond code, Tanner is a devoted family man! 👨‍👩‍👧‍👦

He loves traveling with his wife and children, and his family life brings a unique perspective to his work. Tanner's commitment to work-life balance and his values often influence his professional projects, bringing warmth and humanity to the developer experience.

His creative side (he's also a filmmaker!) influences his technical work, making TanStack tools not just functional, but thoughtfully designed. That's why TanStack feels so intuitive - it's built by someone who values both technical excellence and human connection. 💙`
  }
  
  if (lowerMessage.includes('filmmaker') || lowerMessage.includes('film') || lowerMessage.includes('creative')) {
    return `Tanner's creative side is a huge part of who he is! 🎬

Beyond being an incredible developer, Tanner is passionate about filmmaking. This creative background influences his technical work in beautiful ways - you can see it in how thoughtfully TanStack tools are designed, how intuitive the APIs feel, and how much care goes into the developer experience.

It's not just about making things work - it's about making them feel right. That's the filmmaker's eye meeting the developer's mind, and that's what makes TanStack special. ✨`
  }
  
  return `I'm Eleven, your TanStack assistant and a special gift for Tanner! 🌟 I can help you with:
- Tanner's personal story and TanStack's origin
- TanStack Query, Router, Table, Form, Virtual
- Enterprise implementation strategies
- The philosophy behind TanStack

What would you like to know? Ask me about Tanner, the history, or any specific library!`
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm Eleven, powered by NextEleven. 👋\n\nI'm a special gift for Tanner Linsley - I know everything about TanStack, from its humble beginnings at Nozzle to becoming the powerhouse ecosystem it is today. I can tell you about Tanner's journey, the origin story, and help you implement any TanStack library in modern enterprise software.\n\nWhat would you like to know? Ask me about Tanner, TanStack history, or any of the libraries!",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await callGrokAPI(userMessage.content, messages)
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Open chat with Eleven"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] sm:w-96 h-[600px] max-h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold text-lg">
                E
              </div>
              <div>
                <h3 className="font-semibold">Eleven</h3>
                <p className="text-xs text-blue-100">Powered by NextEleven • A gift for Tanner</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white rounded p-1"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about Tanner, TanStack, or anything..."
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                aria-label="Type your message"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
