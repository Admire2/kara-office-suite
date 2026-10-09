const express = require('express');
const cors = require('cors');
const { Ollama } = require('ollama');

const app = express();
app.use(cors());
app.use(express.json());

const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });

async function searchWeb(query) {
  const logs = [];
  try {
    logs.push('🔍 Querying Kara Search (Homegrown Meta-Search Engine)...');
    const cleanQuery = query.replace(/^["']|["']$/g, '').trim();
    const searchUrl = `http://localhost:8888/search?q=${encodeURIComponent(cleanQuery)}&format=json`;
    
    const response = await fetch(searchUrl, { method: 'GET', headers: { 'Accept': 'application/json', 'User-Agent': 'KaraSeek-Agent/1.0' } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const rawData = await response.text();
    let data;
    try { data = JSON.parse(rawData); } catch (parseError) { throw new Error("SearXNG returned HTML, not JSON."); }

    const resultsArray = data.results || data.data?.results || [];
    
    if (resultsArray.length > 0) {
      logs.push(`✅ Kara Search successful. Found ${resultsArray.length} results.`);
      const formattedResults = resultsArray.map(r => `[Source: ${r.engine || 'Web'}] ${r.title}: ${r.content || r.snippet || r.body || 'No description'}`).join('\n');
      return { success: true, logs, results: formattedResults };
    } else {
      throw new Error("No results found");
    }
  } catch (err) {
    logs.push(`⚠️ Kara Search failed: ${err.message}`);
    return { success: false, logs, results: [] };
  }
}

app.post('/api/seek', async (req, res) => {
  const { goal } = req.body;

  // Split sheet CONTEXT from the actual TASK so the web search gets a clean query
  let task = goal;
  const marker = '\n\nTASK: ';
  const mi = goal.indexOf(marker);
  if (mi !== -1) { task = goal.slice(mi + marker.length); }
  const searchQuery = task.split('\n')[0].split(/\s+/).slice(0, 12).join(' ');
  const isSheetMission = mi !== -1;
  const wantsLive = /research|current|latest|live|today|exchange|vat|tax rate|market|price of|verify|confirm|2026|usd|ngn|inflation/i.test(task);
  
  const systemPrompt = `You are Kara Seek, an advanced autonomous AI Agent built for the Kara Office Suite by Karakata. Current Year: 2026.

CRITICAL PROTOCOLS:
1. SELF-AWARENESS: If asked who you are or to "tell me about yourself", introduce yourself as Kara Seek first.
2. MANDATORY SEARCH: For ANY question asking for lists, rankings, current events, business data, locations, or specific facts (e.g., "top 10 companies", "where is", "status of"), you MUST rely on live search data. 
3. NO LAZY ANSWERS: DO NOT guess lists or facts from your internal memory. Your internal training data is outdated.
4. SHEET MISSIONS: If the user message contains CONTEXT CSV data, those numbers are ground truth. Do the arithmetic carefully step by step. A cell holding a tax AMOUNT is NOT a percentage; compute a percentage only as (amount / base) * 100.
5. RELEVANCE: If the live search results do not match the TASK, ignore them completely and state: "Live sources were not relevant; here is the sheet-based answer."
6. OUTPUT: Wrap your final, complete synthesized answer in <answer> tags.`;

  let conversation = [{ role: 'system', content: systemPrompt }, { role: 'user', content: `COMPLEX GOAL: ${goal}` }];
  let maxSteps = 4;
  let step = 0;
  let allLogs = [];
  let aiText = ''; 

  try {
    while (step < maxSteps) {
      step++;
      allLogs.push(`🧠 Step ${step}: Executing mission phase...`);
      
      const response = await ollama.chat({ model: 'qwen2.5:3b', messages: conversation });
      aiText = response.message.content;
      conversation.push({ role: 'assistant', content: aiText });

      if (step === 1) {
         // ANTI-HALLUCINATION TRIGGER:
         // Only skip search if it's a basic greeting/introduction.
         // For EVERYTHING else (lists, facts, business), FORCE the search.
         const isBasicGreeting = /^(hi|hello|hey|who are you|tell me about yourself|introduce yourself|how are you)/i.test(goal);
         const sheetGrounded = isSheetMission && !wantsLive;
         
         const needsSearch = !isBasicGreeting || aiText.toLowerCase().includes('search');
         
         if (sheetGrounded) {
           allLogs.push('📊 Sheet-grounded mission: answering strictly from uploaded data (no web search).');
           conversation.push({ role: 'user', content: 'GROUNDING RULE: Answer using ONLY the CONTEXT sheet data provided. Do NOT invent numbers, measurements, savings percentages or equipment IDs that are not present in the data. If the data lacks what is needed, state exactly what is missing.' });
           continue;
         }
         if (needsSearch) {
             allLogs.push(`🌐 Agent initiating live data search (Forcing fact-check)...`);
             const searchResult = await searchWeb(searchQuery);
             allLogs.push(...searchResult.logs);

             if (searchResult.success) {
               conversation.push({ role: 'user', content: `LIVE DATA ACQUIRED:\n${searchResult.results}\n\nINSTRUCTION: Synthesize this live data to complete your answer. Wrap in <answer> tags.` });
             } else {
               conversation.push({ role: 'user', content: 'Search failed. Finish your answer, but warn that live data was unavailable.' });
             }
             continue;
         }
      }

      if (aiText.includes('<answer>')) {
        const finalAnswer = aiText.split('<answer>')[1].split('</answer>')[0].trim();
        allLogs.push(`✅ Mission Complete.`);
        return res.json({ success: true, answer: finalAnswer, logs: allLogs });
      }
      
      if (step === 3) {
        conversation.push({ role: 'user', content: 'STOP. Output your final answer inside <answer> tags NOW.' });
      }
    }
    
    res.json({ success: true, answer: aiText, logs: allLogs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`🚀 Kara Seek (Anti-Hallucination) running on port ${PORT}`));



