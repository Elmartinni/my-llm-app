// app/api/chat/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
// Import specific error types if the library provides them, e.g.:
// import { APIError } from 'openai'; // Check OpenAI v4 documentation for exact error types

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // baseURL: 'YOUR_DEEPSEEK_API_ENDPOINT_HERE',
});

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    const chatCompletion = await openai.chat.completions.create({
      model: 'deepseek/deepseek-r1:free', // <--- Note: Using 'deepseek' model here
      messages: messages,
    });

    const message = chatCompletion.choices[0].message?.content;

    return NextResponse.json({ message });

  } catch (error: unknown) { // <-- 'error' is declared here
    console.error('Error in API route:', error); // <-- 'error' is used here

    let errorMessage = 'An unknown error occurred';
    let errorStatus = 500;

    // Type guard to check if it's a structured error (like from OpenAI)
    // Adjust property checks based on actual error structure from OpenAI v4
    if (typeof error === 'object' && error !== null) { // <-- 'error' is used here
        // Check if it resembles an API error structure (you might need to refine this)
        // Note: The structure 'response.data.error.message' is more common in v3 or Axios errors.
        // OpenAI v4 errors might have a different structure. Check its documentation.
        // Let's assume a potential structure for now.
        const potentialApiError = error as { response?: { data?: { error?: { message?: string } }, status?: number }, message?: string, status?: number }; // <-- 'error' is used here

        // Try to extract message and status from common patterns
        errorMessage = potentialApiError.response?.data?.error?.message // Nested structure
                    || potentialApiError.message // Direct message property
                    || errorMessage; // Default
        errorStatus = potentialApiError.response?.status // Nested status
                    || potentialApiError.status // Direct status property (common in OpenAI v4 errors)
                    || errorStatus; // Default

    } else if (error instanceof Error) { // <-- 'error' is used here
        // Check if it's a standard Error object
        errorMessage = error.message; // <-- 'error' is used here
    }

    return NextResponse.json({ error: errorMessage }, { status: errorStatus });
  }
}
