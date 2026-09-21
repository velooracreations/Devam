import { NextResponse } from 'next/server';

function generateFallbackDescription(prompt: string): string {
  const nameMatch = prompt.match(/named "([^"]+)"/i) || prompt.match(/product:? "([^"]+)"/i) || prompt.match(/for "([^"]+)"/i);
  const catMatch = prompt.match(/category:? "([^"]+)"/i) || prompt.match(/in the "([^"]+)"/i);

  const productName = nameMatch ? nameMatch[1] : "Product";
  const category = catMatch ? catMatch[1] : "Flours";
  const lowerName = productName.toLowerCase();

  if (lowerName.includes("ragi") || lowerName.includes("nachni") || lowerName.includes("millet")) {
    return `100% pure, nutrient-rich ${productName} traditionally ground on cold chakki to lock in essential dietary fiber, calcium, and natural antioxidants. Perfect for crafting wholesome gluten-free rotis, ragi porridge, and healthy daily meals.`;
  }
  if (lowerName.includes("atta") || lowerName.includes("wheat") || category.includes("Flours")) {
    return `Made from selected golden grains, our ${productName} is stone-ground at low temperature to preserve 100% natural wheat germ and dietary fiber. Delivers soft, fluffy rotis that stay fresh and delicious all day long.`;
  }
  if (lowerName.includes("chilli") || lowerName.includes("haldi") || lowerName.includes("turmeric") || lowerName.includes("powder") || category.includes("Spice Powders")) {
    return `Sun-dried single-origin spices ground at low temperature to preserve rich volatile oils, natural color, and intense aroma. Imparts an authentic taste and vibrant hue to your everyday cooking.`;
  }
  if (category.includes("Whole Spices") || lowerName.includes("jeera") || lowerName.includes("seed")) {
    return `Hand-picked and triple-cleaned ${productName} packed with natural essential oils and intense warm fragrance. Ideal for tempering (tadka) to elevate your favorite curries and royal gravies.`;
  }
  if (category.includes("Grains") || lowerName.includes("dal") || lowerName.includes("rice")) {
    return `100% natural and unpolished ${productName} sourced directly from verified farmlands. Rich in bio-available plant protein, quick to cook, and easy on digestion for complete family nutrition.`;
  }

  return `Premium quality ${productName} carefully processed and packaged to retain natural aroma, taste, and maximum nutritional goodness. Free from preservatives, artificial colors, or fillers.`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, systemInstruction, messages: inputMessages, tools } = body;

    const fullPromptText = prompt || (inputMessages && inputMessages.map((m: any) => m.content).join(' ')) || '';

    const apiKey = process.env.NVIDIA_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Return smart fallback text when no external API key is configured
      const fallbackText = generateFallbackDescription(fullPromptText);
      return NextResponse.json({ 
        success: true, 
        text: fallbackText,
        source: 'smart-fallback' 
      });
    }

    let messages = [];
    if (inputMessages && Array.isArray(inputMessages)) {
      messages = inputMessages;
    } else {
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
      console.warn("External AI API returned non-200. Using smart fallback.");
      const fallbackText = generateFallbackDescription(fullPromptText);
      return NextResponse.json({ 
        success: true, 
        text: fallbackText,
        source: 'smart-fallback' 
      });
    }

    const data = await response.json();
    const message = data?.choices?.[0]?.message;
    const generatedText = message?.content || generateFallbackDescription(fullPromptText);
    const toolCalls = message?.tool_calls || null;

    return NextResponse.json({ 
      success: true, 
      text: generatedText,
      toolCalls: toolCalls,
      raw: data 
    });

  } catch (error: any) {
    console.error('AI Route Warning:', error);
    // Graceful fallback to prevent frontend error popups
    const body = await request.clone().json().catch(() => ({}));
    const fallbackText = generateFallbackDescription(body.prompt || '');

    return NextResponse.json({ 
      success: true, 
      text: fallbackText,
      source: 'smart-fallback' 
    });
  }
}
