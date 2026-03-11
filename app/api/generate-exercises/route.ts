import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json(
      {
        error: 'N8N_WEBHOOK_URL is not configured on the server.'
      },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();

    const n8nResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const rawText = await n8nResponse.text();
    let parsedResponse: unknown = null;

    if (rawText) {
      try {
        parsedResponse = JSON.parse(rawText);
      } catch {
        parsedResponse = { raw: rawText };
      }
    }

    if (!n8nResponse.ok) {
      return NextResponse.json(
        {
          error: 'n8n webhook request failed.',
          details: parsedResponse,
          status: n8nResponse.status
        },
        { status: 500 }
      );
    }

    return NextResponse.json(parsedResponse ?? {});
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to process generate-exercises request.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
