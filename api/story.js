module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({error:'Use POST'});
  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(500).json({error:'Missing OPENAI_API_KEY in Vercel environment variables.'});
  try {
    const {recent = [], liked = [], disliked = [], surprise = false} = req.body || {};
    const clean = v => Array.isArray(v) ? v.filter(x=>typeof x==='string').slice(0,30).map(x=>x.slice(0,120)) : [];
  
const prompt = `You are the story researcher and writer for The Archive, an app that replaces doomscrolling with fascinating true stories.

Generate ONE interesting, factual story that takes about 5–10 minutes to read.

Choose from unusual true events, mysteries, clever scams, science, psychology, technology, survival, business, and surprising discoveries.

Avoid repeating these recent stories: ${JSON.stringify(recent)}.
User's favorite stories: ${JSON.stringify(liked)}.
Stories the user disliked: ${JSON.stringify(disliked)}.
Surprise mode: ${surprise}.

WRITING RULES:
- Start with a captivating hook.
- Write an entertaining, easy-to-read story.
- Use natural paragraphs.
- Never include URLs, Markdown links, citations, or source references inside the story body.
- Put all sources in the separate sources array.
- Use reliable sources and never invent facts or URLs.

Return ONLY valid JSON in this exact format:
{
  "title": "Story title",
  "category": "Category",
  "hook": "One captivating sentence",
  "story": "The complete story in paragraphs",
  "sources": [
    {"title": "Source name", "url": "https://example.com"}
  ]
}
`;
    const response = await fetch('https://api.openai.com/v1/responses', {
      method:'POST', headers:{'Authorization':`Bearer ${key}`,'Content-Type':'application/json'},
      body:JSON.stringify({model:'gpt-4.1-mini',tools:[{type:'web_search_preview'}],input:prompt,max_output_tokens:2600})
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({error:data.error?.message || 'OpenAI request failed'});
    const raw = (data.output||[]).flatMap(o => o.content||[]).filter(c=>c.type==='output_text').map(c=>c.text).join('\n').trim();
    const cleaned = raw.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
    let story;
    try {story=JSON.parse(cleaned);} catch(e) { return res.status(502).json({error:'AI returned an invalid story format. Please try again.'}); }
    if (!story?.title || !story?.story || !Array.isArray(story.sources)) return res.status(502).json({error:'Story response was incomplete. Please try again.'});
    return res.status(200).json({story});
  } catch (e) {return res.status(500).json({error:'Could not generate a story. Please try again.'});}
};
