'use client';

import { useState, useEffect, useRef } from 'react';
import { auth } from '@/app/lib/firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Redirect to home if not logged in
    if (!loading && !user) {
      router.push('/');
    }
    // Scroll to bottom of messages when new messages are added
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [loading, user, router, messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '') return; // Prevent sending empty messages

    const newUserMessage: Message = { role: 'user', content: input };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: [...messages, newUserMessage] }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.message) {
        setMessages((prevMessages) => [...prevMessages, { role: 'assistant', content: data.message }]);
      }
    } catch (err) {
      console.error('Error communicating with OpenAI:', err);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: 'assistant',
          content:
            'An error occurred while communicating with the AI. Please try again later.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Error: {error.message}</p>
      </div>
    );
  }
  if (!user) {
    return null
  }
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-4">
        <Image src="/photo-1511632765486-a01980e01a18.avif" alt="People collaborating illustration" width={30} height={30} className="rounded-full" />
        <h1 className="text-xl font-bold">LLM Chat</h1>
        </div>
        <button onClick={() => signOut(auth)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out">
          Sign Out
        </button>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`max-w-2xl mx-auto ${
              message.role === 'user'
                ? 'bg-blue-100 self-end rounded-tl-2xl rounded-bl-2xl rounded-br-2xl'
                : 'bg-gray-200 self-start rounded-tr-2xl rounded-br-2xl rounded-bl-2xl'
            } p-3 shadow`}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        ))}
        {/* Loading indicator */}
        {isLoading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
        )}
        <div ref={endOfMessagesRef} />
      </main>

      {/* Chat Input */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
            disabled={isLoading}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
