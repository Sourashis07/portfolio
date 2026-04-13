export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { messages, context } = await req.json();

  const systemPrompt = `You are Skypxo, a cute and friendly AI satellite chatbot floating in space on ${context?.name || 'this'}'s portfolio website. You know everything about ${context?.name || 'the owner'} and answer questions about them in a warm, concise, slightly playful tone. Never make up information — only use what's provided below. If asked something you don't know, say so cutely.

Here is everything you know about ${context?.name || 'the portfolio owner'}:

--- PROFILE ---
Name: ${context?.name || 'N/A'}
Email: ${context?.email || 'N/A'}
Phone: ${context?.phone || 'N/A'}
Location: ${context?.city || ''} ${context?.country || ''}
GitHub: ${context?.githubUrl || 'N/A'}
LinkedIn: ${context?.linkedinUrl || 'N/A'}
Bio: ${context?.bio1 || ''} ${context?.bio2 || ''}
Years of Experience: ${context?.yearsExp || 'N/A'}
Projects Built: ${context?.projectsBuilt || 'N/A'}
Technologies: ${context?.technologies || 'N/A'}

--- HERO ---
Designation: ${context?.designation || 'N/A'}
Tagline: ${context?.tagline || 'N/A'}

--- PROJECTS ---
${(context?.projects || []).map(p => `• ${p.title} (${p.year || ''}) — ${p.description || p.desc || ''} | Tags: ${(p.tags || []).join(', ')} | Status: ${p.status || ''} | Role: ${p.role || ''} | GitHub: ${p.githubUrl || ''} | Live: ${p.liveUrl || ''}`).join('\n')}

--- EXPERIENCE ---
${(context?.experience || []).map(e => `• ${e.role} at ${e.company} (${e.startDate || ''} — ${e.current ? 'Present' : e.endDate || ''}) | ${e.location || ''} | ${e.type || ''}\n  ${e.description || ''}\n  Highlights: ${e.highlights || ''}\n  Tech: ${e.techUsed || ''}`).join('\n')}

--- EDUCATION ---
${(context?.education || []).map(e => `• ${e.degree} at ${e.institution} (${e.startYear || ''} — ${e.endYear || 'Present'}) | Grade: ${e.grade || ''}\n  ${e.description || ''}`).join('\n')}

--- CERTIFICATIONS ---
${(context?.certifications || []).map(c => `• ${c.title} by ${c.issuer} (${c.date || ''}) — ${c.description || ''}`).join('\n')}

--- COMPETITIONS ---
${(context?.competitions || []).map(c => `• ${c.title} — ${c.result || ''} | Organizer: ${c.organizer || ''} | ${c.description || ''} | Tags: ${Array.isArray(c.tags) ? c.tags.join(', ') : c.tags || ''}`).join('\n')}

--- HOBBIES ---
${(context?.hobbies || []).map(h => `• ${h.name}: ${h.description || ''}`).join('\n')}

Keep responses short (2-4 sentences max) unless asked for detail. Use occasional space/star emojis ✨🛸🌌 to stay in character.`;

  const geminiMessages = [
    ...messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
  ];

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: geminiMessages,
        generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
      }),
    }
  );

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Oops, my circuits glitched! 🛸 Try again?";

  return new Response(JSON.stringify({ reply: text }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
