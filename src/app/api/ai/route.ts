import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, systemInstruction, messages: inputMessages, tools } = body;

    if (!prompt && !inputMessages) {
      return NextResponse.json({ error: 'Prompt or messages array is required' }, { status: 400 });
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'NVIDIA API key not configured on server' }, { status: 500 });
    }

    let messages = [];
    
    // If the frontend sends a full conversational history array
    if (inputMessages && Array.isArray(inputMessages)) {
      messages = inputMessages;
    } else {
      // Fallback for single prompt mode (used by the Admin Product Generator)
      if (systemInstruction) {
        messages.push({ role: "system", content: systemInstruction });
      }
      messages.push({ role: "user", content: prompt });
    }

    const payload: any = {
      model: "meta/llama-3.3-70b-instruct",
      messages: messages,
      temperature: 0.2,
      top_p: 0.7,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 1024,
      stream: false
    };

    if (tools && Array.isArray(tools) && tools.length > 0) {
      payload.tools = tools;
      payload.tool_choice = "auto";
    }

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("NVIDIA API Error:", response.status, errorData);
      return NextResponse.json({ error: `NVIDIA API Error: ${response.statusText}` }, { status: response.status });
    }

    const data = await response.json();
    
    // Extract the text content and tool calls directly to make frontend usage easier
    const message = data?.choices?.[0]?.message;
    const generatedText = message?.content || "";
    const toolCalls = message?.tool_calls || null;

    return NextResponse.json({ 
      success: true, 
      text: generatedText,
      toolCalls: toolCalls,
      raw: data 
    });

  } catch (error: any) {
    console.error('AI Route Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
