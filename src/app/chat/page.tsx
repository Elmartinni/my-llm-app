'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { auth } from '@/app/lib/firebase/config'; // Adjust path if needed
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
// Optional: Import icons
import { PaperAirplaneIcon, UserCircleIcon, CpuChipIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'; // Or solid

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

// Basic Markdown-like code block detection and rendering
const renderMessageContent = (content: string) => {
    // Simple regex to find ```code``` blocks
    const codeBlockRegex = /```([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
        // Add text before the code block
        if (match.index > lastIndex) {
            parts.push(
                <span key={`text-${lastIndex}`}>
                    {content.substring(lastIndex, match.index)}
                </span>
            );
        }
        // Add the code block
        parts.push(
            <pre key={`code-${match.index}`} className="bg-gray-800 text-white p-3 rounded-md my-2 overflow-x-auto text-sm font-mono">
                <code>{match[1].trim()}</code>
            </pre>
        );
        lastIndex = match.index + match[0].length;
    }

    // Add any remaining text after the last code block
    if (lastIndex < content.length) {
        parts.push(
            <span key={`text-${lastIndex}`}>
                {content.substring(lastIndex)}
            </span>
        );
    }

    // If no code blocks found, return the original content wrapped in a span
    if (parts.length === 0) {
        return <span>{content}</span>;
    }

    return <>{parts}</>;
};


export default function ChatPage() {
    const [user, loading, error] = useAuthState(auth);
    const router = useRouter();

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const endOfMessagesRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // --- Authentication and Redirection Effect ---
    useEffect(() => {
        if (!loading && !user) {
            router.push('/'); // Redirect to home if not logged in
        }
    }, [loading, user, router]);

    // --- Scroll to Bottom Effect ---
    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]); // Trigger scroll whenever messages change

    // --- Auto-resize Textarea Effect ---
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto'; // Reset height
            textarea.style.height = `${textarea.scrollHeight}px`; // Set to scroll height
        }
    }, [input]); // Adjust height when input changes

    // --- Handle Send Message ---
    const sendMessage = useCallback(async () => {
        const trimmedInput = input.trim();
        if (trimmedInput === '' || isLoading || !user) return; // Prevent sending empty/during load/if not logged in

        const newUserMessage: Message = { role: 'user', content: trimmedInput };
        const updatedMessages = [...messages, newUserMessage];

        setMessages(updatedMessages);
        setInput(''); // Clear input immediately
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Send the whole conversation history for context
                body: JSON.stringify({ messages: updatedMessages }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({})); // Try to parse error
                throw new Error(`API error: ${response.statusText} - ${errorData.error || 'Unknown error'}`);
            }

            const data = await response.json();
            if (data.message) {
                setMessages((prevMessages) => [...prevMessages, { role: 'assistant', content: data.message }]);
            } else {
                 throw new Error("No message content received from API");
            }
        } catch (err) {
            console.error('Error sending message:', err);
            setMessages((prevMessages) => [
                ...prevMessages,
                { role: 'assistant', content: `Sorry, I encountered an error. Please try again. (${err instanceof Error ? err.message : 'Unknown error'})` },
            ]);
        } finally {
            setIsLoading(false);
            // Refocus textarea after sending
            textareaRef.current?.focus();
        }
    }, [input, isLoading, messages, user]); // Dependencies for useCallback

    // --- Handle Textarea Key Press (Send on Enter, Newline on Shift+Enter) ---
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent default newline insertion
            sendMessage();
        }
    };

    // --- Handle Sign Out ---
    const handleSignOut = async () => {
        try {
            await signOut(auth);
            // No need to manually push, the useEffect hook will detect the user change
            // router.push('/');
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    // --- Render Loading/Error/Auth States ---
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }
    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-red-100 text-red-700 p-4">
                <p>Authentication Error: {error.message}. Please try refreshing.</p>
            </div>
        );
    }
    // If loading is done and still no user, the useEffect will redirect,
    // but we return null to prevent rendering the chat UI momentarily.
    if (!user) {
        return null;
    }

    // --- Render Chat UI ---
    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Header */}
            <header className="bg-gray-50 border-b border-gray-200 px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center space-x-3">
                    {/* You can replace this with a proper logo */}
                    <CpuChipIcon className="h-6 w-6 text-blue-600" />
                    <h1 className="text-lg font-semibold text-gray-800">AI Chat</h1>
                </div>
                <div className="flex items-center space-x-4">
                     <span className="text-sm text-gray-500 hidden sm:inline">
                        {user.email}
                    </span>
                    <button
                        onClick={handleSignOut}
                        title="Sign Out"
                        className="p-1 text-gray-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-md"
                    >
                        <ArrowRightOnRectangleIcon className="h-6 w-6" />
                    </button>
                </div>
            </header>

            {/* Main Chat Area */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
                {messages.map((message, index) => (
                    <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {/* Assistant Icon */}
                        {message.role === 'assistant' && (
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                <CpuChipIcon className="h-5 w-5" />
                            </div>
                        )}

                        {/* Message Bubble */}
                        <div
                            className={`max-w-xl px-4 py-3 rounded-2xl shadow-sm ${
                                message.role === 'user'
                                    ? 'bg-blue-500 text-white rounded-br-none' // User message style
                                    : 'bg-gray-100 text-gray-800 rounded-bl-none' // Assistant message style
                            }`}
                        >
                            {/* Render content with potential code blocks */}
                            <div className="prose prose-sm max-w-none text-inherit whitespace-pre-wrap">
                                {renderMessageContent(message.content)}
                            </div>
                        </div>

                        {/* User Icon */}
                        {message.role === 'user' && (
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                                <UserCircleIcon className="h-6 w-6" />
                            </div>
                        )}
                    </div>
                ))}

                {/* Loading indicator during response generation */}
                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <div className="flex items-start gap-3 justify-start">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white animate-pulse">
                            <CpuChipIcon className="h-5 w-5" />
                        </div>
                        <div className="max-w-xl px-4 py-3 rounded-2xl shadow-sm bg-gray-100 rounded-bl-none">
                            <div className="flex space-x-1 items-center">
                                <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty div to scroll to */}
                <div ref={endOfMessagesRef} />
            </main>

            {/* Chat Input Area */}
            <footer className="bg-gray-50 border-t border-gray-200 p-4 sticky bottom-0">
                <div className="max-w-3xl mx-auto flex items-end space-x-3">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message here... (Shift+Enter for newline)"
                        className="flex-1 border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm max-h-40 overflow-y-auto" // Added max-h and overflow
                        rows={1} // Start with one row
                        disabled={isLoading}
                    />
                    <button
                        type="button"
                        onClick={sendMessage}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out flex-shrink-0"
                        disabled={isLoading || input.trim() === ''}
                        title="Send Message"
                    >
                        <PaperAirplaneIcon className="h-5 w-5" />
                    </button>
                </div>
            </footer>
        </div>
    );
}
