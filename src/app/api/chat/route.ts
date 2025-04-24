// app/api/chat/route.ts
import { NextResponse } from 'next/server';
// 1. Use the v4 import style
import OpenAI from 'openai';

// 2. Initialize the client directly using the v4 style
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // 3. (Optional but Recommended for non-standard models/endpoints)
  // If 'deepseek/deepseek-r1:free' requires a different API base URL, add it here:
  // baseURL: 'YOUR_DEEPSEEK_API_ENDPOINT_HERE', // e.g., 'https://api.deepseek.com/v1'
});

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    // 4. Use the v4 method `chat.completions.create`
    const chatCompletion = await openai.chat.completions.create({
      model: 'deepseek/deepseek-r1:free', // Or 'gpt-3.5-turbo', 'gpt-4', etc. for standard OpenAI
      messages: messages,
    });

    // 5. Access the response directly (no `.data`)
    const message = chatCompletion.choices[0].message?.content;

    return NextResponse.json({ message });

  } catch (error: any) { // Catch specific error types if needed
    console.error('Error in API route:', error);

    // Provide more specific error feedback if possible
    const errorMessage = error.response?.data?.error?.message || error.message || 'An error occurred';
    const errorStatus = error.response?.status || 500;

    return NextResponse.json({ error: errorMessage }, { status: errorStatus });
  }
}
