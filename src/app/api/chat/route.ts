// app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    const chatCompletion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo', // Or your preferred model
      messages: messages,
    });

    const message = chatCompletion.data.choices[0].message?.content;
    return NextResponse.json({ message });
  } catch (err) {
    console.error('Error in API route:', err);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
