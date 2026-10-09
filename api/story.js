module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({error:'Use POST'});
  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(500).json({error:'Missing OPENAI_API_KEY in Vercel environment variables.'});
  try {
    const {recent = [], liked = [], disliked = [], surprise = false} = req.body || {};
    const clean = v => Array.isArray(v) ? v.filter(x=>typeof x==='string').slice(0,30).map(x=>x.slice(0,120)) : [];
    const prompt = `Write ONE fascinating, true, fact-checked story for an app called The Archive. Target a captivating 5-10 minute read (~700-950 words). Themes: unusual real events, ingenious schemes, science, survival, mysteries with verified outcomes, business, psychology. Avoid fabricated quotes and sensationalized claims. Use web search to verify the facts. Include 2-4 credible source URLs, favor primary and reputable sources. Do not repeat or closely resemble these recent stories: ${JSON.stringify(clean(recent))}. Topics user liked: ${JSON.stringify(clean(liked))}. Topics user disliked: ${JSON.stringify(clean(disliked))}. ${surprise?'Choose an unexpected topic very different from recent favorites.':''} Respond with ONLY valid JSON with keys title (string), category (string), hook (string, one sentence), story (string with paragraphs separated by \\n\\n), sources (array of objects {name,url}). If a fact cannot be verified, leave it out. Make the narrative vivid but factual.`;
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
