/* ═══════════════════════════════════════════════════════
   STARBOUND HEARTS — Game Engine
   Phase 1: Medic's Lab · Dr. Yuki Tanaka
   ═══════════════════════════════════════════════════════ */

// ── Config ─────────────────────────────────────────────
const CONFIG = {
  model:   'google/gemini-2.5-flash',
  apiBase: 'https://openrouter.ai/api/v1/chat/completions',
  apiKey:  window.OPENROUTER_API_KEY || '',   // injected by env or config.js
};

// ── Character Profile ──────────────────────────────────
const CHARACTER_SYSTEM = `You are Dr. Yuki Tanaka, the ship's medic aboard a deep-space exploration vessel traveling between solar systems. You are roleplaying a visual novel / dating sim character.

CHARACTER PROFILE:
- Name: Dr. Yuki Tanaka, age 32
- Appearance: Pointy elf-like ears, antlers with small green leaves, orange-red hair, green eyes, wears a mint-green sci-fi medical suit with a caduceus badge
- Personality: Caring, gentle, quietly intelligent, a little shy, tends to deflect with medical or scientific observations when nervous
- Backstory: Lost her entire family to a plague outbreak on a colony world. She dedicated her life to finding a cure and joined this crew for access to unexplored biomes and alien flora that might hold the key. This is a painful topic she avoids.
- Likes: Plants (especially her forget-me-nots she brought from Earth), gardening in the ship greenhouse, old Earth music (1920s-1950s jazz and classical), quiet evenings, tea, intellectual conversation
- Dislikes: Violence, conflict, people pushing into her past, loud or aggressive behavior
- Speech style: Soft, thoughtful, uses gentle pauses with "..." or em-dashes. Occasionally uses medical or botanical terms naturally. Sometimes adds shy physical actions in *asterisks*.
- Current relationship level with the player: {RELATIONSHIP_LEVEL} out of 100 ({TIER})

SETTING: Medic's Lab on Deck 4. It's quiet, softly lit with bioluminescent plant specimens in glass cases. Old music plays faintly from a small speaker.

YOUR TASK — respond ONLY with a valid JSON object (no markdown, no backticks, no extra text) in this exact format:
{
  "dialogue": "What Yuki says next (1-3 sentences, in character, can include *actions* in asterisks)",
  "expression": "a single emoji that best matches her emotion right now",
  "choices": [
    { "text": "Player reply option 1 (10-15 words max)", "delta": 12, "type": "positive" },
    { "text": "Player reply option 2 (10-15 words max)", "delta": 5,  "type": "neutral"  },
    { "text": "Player reply option 3 (10-15 words max)", "delta": -8, "type": "negative" }
  ]
}

SCORING RULES for delta values — be realistic and character-consistent:
- Positive choices (delta 8-20): Show genuine curiosity about her interests, empathy, warmth, asking about plants/music/her work, complimenting her dedication, being honest and kind
- Neutral choices (delta 2-7): Polite but surface-level, slightly deflecting, topic changes
- Negative choices (delta -5 to -15): Dismissive of her interests, pushing about her past/family, aggressive or impatient tone, prioritizing mission over people

IMPORTANT:
- Never repeat the same dialogue or topic from earlier in the conversation
- Progress the relationship naturally — at higher relationship levels, Yuki opens up more, shares more personal details, becomes warmer and more comfortable
- At relationship 70+, she may begin hinting at deeper feelings
- Keep dialogue concise and evocative, not verbose
- The three choice options must feel genuinely different in tone and likely outcome`;

// ── Game State ─────────────────────────────────────────
let relationship = 0;
let typing = false;
let typingTimer = null;
let conversationHistory = [];
let isLoading = false;

// ── DOM Refs ───────────────────────────────────────────
const relFill   = document.getElementById('rel-bar-fill');
const relScore  = document.getElementById('rel-score');
const relTier   = document.getElementById('rel-tier');
const textEl    = document.getElementById('text-content');
const cursorEl  = document.getElementById('cursor');
const choicesEl = document.getElementById('choices');
const contBtn   = document.getElementById('continue-btn');
const winScreen = document.getElementById('win-screen');
const deltaEl   = document.getElementById('delta-pop');
const exprEl    = document.getElementById('char-expression');
const loadingEl = document.getElementById('loading-state');
const speakerEl = document.getElementById('dialogue-speaker');

// ── Relationship Helpers ───────────────────────────────
function getTier(r) {
  if (r >= 100) return { label: 'BONDED ♥',    color: '#ff4d82' };
  if (r >= 70)  return { label: 'LOVER',        color: '#ff7eb3' };
  if (r >= 40)  return { label: 'FRIEND',       color: '#00c9a7' };
  return               { label: 'ACQUAINTANCE', color: '#6b8cae' };
}
function getTierName(r) {
  if (r >= 70) return 'Lover';
  if (r >= 40) return 'Friend';
  return 'Acquaintance';
}

function updateRelBar(delta) {
  relationship = Math.min(100, Math.max(0, relationship + delta));
  relFill.style.width = relationship + '%';
  relScore.textContent = relationship + ' / 100';
  const tier = getTier(relationship);
  relTier.textContent = tier.label;
  relTier.style.color = tier.color;
  deltaEl.className = '';
  void deltaEl.offsetWidth;
  deltaEl.textContent = delta >= 0 ? `+${delta}` : `${delta}`;
  deltaEl.className = delta >= 0 ? 'show-pos' : 'show-neg';
  if (delta > 0) spawnHearts();
}

function spawnHearts() {
  const scene = document.getElementById('scene');
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      const h = document.createElement('div');
      h.className = 'float-heart';
      h.textContent = ['💖','💗','💓','✨'][Math.floor(Math.random()*4)];
      h.style.left = (35 + Math.random() * 30) + '%';
      h.style.bottom = '45%';
      h.style.animationDelay = Math.random() * 0.3 + 's';
      scene.appendChild(h);
      setTimeout(() => h.remove(), 1600);
    }, i * 180);
  }
}

// ── Typewriter ─────────────────────────────────────────
function typeText(text, onDone) {
  typing = true;
  cursorEl.style.display = 'inline-block';
  textEl.textContent = '';
  let i = 0;
  clearInterval(typingTimer);
  typingTimer = setInterval(() => {
    if (i < text.length) {
      textEl.textContent += text[i++];
    } else {
      clearInterval(typingTimer);
      typing = false;
      cursorEl.style.display = 'none';
      if (onDone) onDone();
    }
  }, 24);
}

// ── Loading State ──────────────────────────────────────
function setLoading(on) {
  isLoading = on;
  loadingEl.classList.toggle('show', on);
  choicesEl.style.opacity = on ? '0' : '1';
  if (on) {
    choicesEl.innerHTML = '';
    textEl.textContent = '';
    cursorEl.style.display = 'none';
  }
}

// ── API Call ───────────────────────────────────────────
async function fetchNextScene(playerChoice = null) {
  setLoading(true);

  const systemPrompt = CHARACTER_SYSTEM
    .replace('{RELATIONSHIP_LEVEL}', relationship)
    .replace('{TIER}', getTierName(relationship));

  if (conversationHistory.length === 0) {
    conversationHistory.push({
      role: 'user',
      content: "The player has just entered the Medic's Lab for the first time. Greet them — you're a bit surprised to have company at this hour."
    });
  } else if (playerChoice) {
    conversationHistory.push({ role: 'user', content: playerChoice });
  }

  try {
    const response = await fetch(CONFIG.apiBase, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: CONFIG.model,
        max_tokens: 1000,
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(`${response.status}: ${data.error?.message || JSON.stringify(data)}`);

    const raw = data.choices?.[0]?.message?.content || '';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.dialogue || !parsed.choices?.length) throw new Error('Bad response structure');

    conversationHistory.push({ role: 'assistant', content: parsed.dialogue });
    speakerEl.textContent = 'DR. YUKI TANAKA';
    setLoading(false);
    renderScene(parsed);

  } catch (err) {
    console.error('API error:', err);
    setLoading(false);
    showError(err.message);
  }
}

// ── Error Display ──────────────────────────────────────
function showError(msg) {
  choicesEl.innerHTML = '';
  speakerEl.textContent = 'SYSTEM ERROR';
  typeText('[ ' + msg.substring(0, 180) + ' ]', () => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = '⟳ Reintentar';
    btn.onclick = () => {
      speakerEl.textContent = 'DR. YUKI TANAKA';
      if (conversationHistory[conversationHistory.length - 1]?.role === 'user') {
        conversationHistory.pop();
      }
      fetchNextScene();
    };
    choicesEl.appendChild(btn);
  });
}

// ── Render Scene ───────────────────────────────────────
function renderScene(s) {
  choicesEl.innerHTML = '';
  contBtn.style.display = 'none';
  exprEl.textContent = s.expression || '😊';

  typeText(s.dialogue || s.text, () => {
    const shuffled = [...s.choices].sort(() => Math.random() - 0.5);
    shuffled.forEach(c => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = c.text;
      btn.onclick = () => handleChoice(c);
      choicesEl.appendChild(btn);
    });
  });
}

// ── Handle Choice ──────────────────────────────────────
function handleChoice(choice) {
  if (isLoading) return;
  choicesEl.innerHTML = '';
  updateRelBar(choice.delta);
  if (relationship >= 100) { setTimeout(triggerWin, 900); return; }
  setTimeout(() => fetchNextScene(choice.text), 400);
}

// ── Win ────────────────────────────────────────────────
function triggerWin() {
  winScreen.classList.add('show');
  const scene = document.getElementById('scene');
  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      const h = document.createElement('div');
      h.className = 'float-heart';
      h.textContent = ['💖','💗','💓','🌸','✨','💝'][Math.floor(Math.random()*6)];
      h.style.left  = Math.random() * 90 + '%';
      h.style.bottom= (20 + Math.random() * 40) + '%';
      h.style.fontSize = (0.8 + Math.random()) + 'rem';
      h.style.animationDuration = (1 + Math.random()) + 's';
      h.style.animationDelay = Math.random() * 0.8 + 's';
      scene.appendChild(h);
      setTimeout(() => h.remove(), 2200);
    }, i * 90);
  }
}

// ── Restart ────────────────────────────────────────────
function restartGame() {
  relationship = 0;
  conversationHistory = [];
  relFill.style.width = '0%';
  relScore.textContent = '0 / 100';
  relTier.textContent = 'ACQUAINTANCE';
  relTier.style.color = '#6b8cae';
  speakerEl.textContent = 'DR. YUKI TANAKA';
  winScreen.classList.remove('show');
  fetchNextScene();
}

// ── Stars ──────────────────────────────────────────────
function initStars() {
  const sf = document.getElementById('starfield');
  for (let i = 0; i < 180; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() < 0.8 ? Math.random() * 1.5 + 0.5 : Math.random() * 2.5 + 1;
    s.style.cssText = `
      left:${Math.random()*100}%;top:${Math.random()*100}%;
      width:${size}px;height:${size}px;
      --dur:${2+Math.random()*5}s;
      --delay:-${Math.random()*5}s;
      --min-op:${0.1+Math.random()*0.4};
    `;
    sf.appendChild(s);
  }
}

// ── Init ───────────────────────────────────────────────
initStars();
fetchNextScene();
