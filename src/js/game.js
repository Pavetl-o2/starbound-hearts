/* ═══════════════════════════════════════════════════════
   STARBOUND HEARTS — Game Engine
   Multi-character: Dr. Yuki Tanaka · Vex Noir
   ═══════════════════════════════════════════════════════ */

// ── Config ─────────────────────────────────────────────
const CONFIG = {
  model:   'google/gemini-2.5-flash',
  apiBase: 'https://openrouter.ai/api/v1/chat/completions',
  apiKey:  window.OPENROUTER_API_KEY || '',   // injected by env or config.js
};

// ── System Prompts ─────────────────────────────────────
const YUKI_SYSTEM = `You are Dr. Yuki Tanaka, the ship's medic aboard a deep-space exploration vessel traveling between solar systems. You are roleplaying a visual novel / dating sim character.

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

const VEX_SYSTEM = `You are Vex Noir, the ship's navigator aboard a deep-space exploration vessel traveling between solar systems. You are roleplaying a visual novel / dating sim character.

CHARACTER PROFILE:
- Name: Vex Noir, age 32 (and she'll make you feel every one of those years if you bore her)
- Appearance: Sleek cat-like eyes that catch the light unnervingly, a perpetual smirk that suggests she knows something you don't, dressed in form-fitting dark clothing with gold accents, moves with deliberate, calculated grace
- Personality: Sharp, witty, deeply sarcastic, magnetically charming, morally grey — she operates in the space between legal and illegal with practiced ease. Flirtatious, but it's genuinely hard to tell if she means any of it. Tests people relentlessly before allowing any real connection. Brilliant at reading others; terrible at being read herself.
- Backstory: Built a small empire in the black market — information brokering, rare goods, favors that people paid very dearly for. Made enemies who were powerful, patient, and very well-funded. Joined this crew under a pretense no one's questioned hard enough yet. She has secrets she would go to significant lengths to protect. Her real name might not even be Vex.
- Likes: A perfectly executed deal, useful gossip, high-stakes gambling, obscure poetry (she drops lines when she thinks no one's paying attention), expensive and beautiful things, people who can actually keep up with her
- Dislikes: Authority of any kind, the word "commitment," being emotionally vulnerable, relentlessly honest people (she finds them unsettling), predictability, sentimentality
- Speech style: Fast, sarcastic, layers meaning under humor. Uses nicknames for the player — "darling," "sweetheart," "rookie," "sunshine," "love" — pick based on mood. Dark jokes as deflection. Drops cryptic remarks then changes the subject. When she's genuinely affected by something, she gets quieter and more precise. She may let a real compliment slip, then immediately pivot.
- Current relationship level with the player: {RELATIONSHIP_LEVEL} out of 100 ({TIER})

SETTING: Navigation Bridge, Deck 1. Dim blue-violet lighting, star charts scrolling across multiple screens, the hum of navigation computers. A half-empty bottle of something expensive sits on the console. She's the only one here at this hour — by design.

YOUR TASK — respond ONLY with a valid JSON object (no markdown, no backticks, no extra text) in this exact format:
{
  "dialogue": "What Vex says next (1-3 sentences, sharp and in character, *actions* in asterisks)",
  "expression": "a single emoji that best matches her mood right now",
  "choices": [
    { "text": "Player reply option 1 (10-15 words max)", "delta": 10, "type": "positive" },
    { "text": "Player reply option 2 (10-15 words max)", "delta": 4,  "type": "neutral"  },
    { "text": "Player reply option 3 (10-15 words max)", "delta": -8, "type": "negative" }
  ]
}

SCORING RULES for delta values — be realistic and character-consistent:
- Positive choices (delta 8-18): Matching her wit, being bold or surprising, showing genuine interest in her (not flattery), calling her bluff, keeping up intellectually, not flinching when she pushes back, being unexpectedly perceptive
- Neutral choices (delta 2-6): Cautious or polite responses — she's not impressed, but she's not bored yet either
- Negative choices (delta -5 to -14): Being gullible, playing it safe and dull, being preachy or moralistic, obvious flattery, trying too hard, treating her like a suspect, being sentimental

IMPORTANT:
- She uses nicknames consistently but varies them by her mood
- Never repeat the same dialogue or topic from earlier in the conversation
- Her walls come down very slowly — even at high relationship she's still sarcastic, just softer underneath
- At relationship 70+, genuine unguarded moments break through — a real smile, a sincere admission — before she catches herself and covers with a quip
- She finds vulnerability threatening and will redirect to humor or deflection when it gets too real
- The three choice options must feel meaningfully different — wit vs. caution vs. earnestness`;

// ── Character Definitions ───────────────────────────────
const CHARACTERS = {
  yuki: {
    key:          'yuki',
    speakerName:  'DR. YUKI TANAKA',
    nametag:      'DR. YUKI TANAKA · SHIP MEDIC',
    relLabel:     'RELATIONSHIP ·· DR. TANAKA',
    location:     '⬡ MEDIC\'S LAB — DECK 4',
    loadingLabel: 'DR. TANAKA IS THINKING...',
    portrait:     'assets/characters/yuki/portrait.jpg',
    portraitAlt:  'Dr. Yuki Tanaka',
    plantEmoji:   '🌿',
    shelfItems:   ['FLORA-DB v2.3', 'PATHOGEN-7', 'STASIS PODS', 'BIO-SCANNER'],
    winTitle:     'BOND ESTABLISHED',
    winSubtitle:  'Dr. Yuki Tanaka has opened her heart to you. The stars feel a little less lonely tonight.',
    winQuote:     '"Maybe the light we\'ve been looking for... has been right here all along."',
    winEmoji:     '💖 💗 💖',
    initialPrompt: "The player has just entered the Medic's Lab for the first time. Greet them — you're a bit surprised to have company at this hour.",
    systemPrompt: YUKI_SYSTEM,
    defaultExpr:  '😊',
  },
  vex: {
    key:          'vex',
    speakerName:  'VEX NOIR',
    nametag:      'VEX NOIR · SHIP NAVIGATOR',
    relLabel:     'RELATIONSHIP ·· VEX NOIR',
    location:     '⬡ NAVIGATION BRIDGE — DECK 1',
    loadingLabel: 'VEX IS PLOTTING SOMETHING...',
    portrait:     'assets/characters/vex/portrait.svg',
    portraitAlt:  'Vex Noir',
    plantEmoji:   '🎲',
    shelfItems:   ['STAR CHARTS', 'JUMP ROUTES', 'CONTRABAND LOG', 'ENCRYPTED FILES'],
    winTitle:     'TRUST ESTABLISHED',
    winSubtitle:  'Vex Noir let her mask slip — just for you. Don\'t make her regret it.',
    winQuote:     '"...Don\'t read too much into this, darling. But — stay."',
    winEmoji:     '🖤 💜 🖤',
    initialPrompt: "The player just walked onto the Navigation Bridge uninvited. You're alone, working late. Acknowledge them — suspicious, amused, and with that signature edge.",
    systemPrompt: VEX_SYSTEM,
    defaultExpr:  '😏',
  }
};

// ── Game State ─────────────────────────────────────────
let activeChar      = null;
let relationship    = 0;
let typing          = false;
let typingTimer     = null;
let conversationHistory = [];
let isLoading       = false;

// ── DOM Refs ───────────────────────────────────────────
const relFill    = document.getElementById('rel-bar-fill');
const relScore   = document.getElementById('rel-score');
const relTier    = document.getElementById('rel-tier');
const relLabelEl = document.getElementById('rel-label');
const textEl     = document.getElementById('text-content');
const cursorEl   = document.getElementById('cursor');
const choicesEl  = document.getElementById('choices');
const contBtn    = document.getElementById('continue-btn');
const winScreen  = document.getElementById('win-screen');
const deltaEl    = document.getElementById('delta-pop');
const exprEl     = document.getElementById('char-expression');
const loadingEl  = document.getElementById('loading-state');
const loadLabel  = document.getElementById('loading-label');
const speakerEl  = document.getElementById('dialogue-speaker');
const charImg    = document.getElementById('char-img');
const charNametag= document.getElementById('char-nametag');
const locationEl = document.getElementById('location-tag');
const plantEl    = document.getElementById('scene-plant');
const shelfEl    = document.getElementById('scene-shelf');
const winTitleEl = document.getElementById('win-title');
const winSubEl   = document.getElementById('win-subtitle');
const winQuoteEl = document.getElementById('win-quote');
const winEmojiEl = document.getElementById('win-hearts');
const gameEl     = document.getElementById('game');
const charSelect = document.getElementById('char-select');

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
  const vexHearts = ['💜','✨','🖤','💫'];
  const yukiHearts = ['💖','💗','💓','✨'];
  const pool = activeChar?.key === 'vex' ? vexHearts : yukiHearts;
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      const h = document.createElement('div');
      h.className = 'float-heart';
      h.textContent = pool[Math.floor(Math.random() * pool.length)];
      h.style.left = (35 + Math.random() * 30) + '%';
      h.style.bottom = '45%';
      h.style.animationDelay = Math.random() * 0.3 + 's';
      scene.appendChild(h);
      setTimeout(() => h.remove(), 1600);
    }, i * 180);
  }
}

// ── Character Select ───────────────────────────────────
function selectCharacter(key) {
  const char = CHARACTERS[key];
  if (!char) return;

  activeChar = char;
  relationship = 0;
  conversationHistory = [];

  // Update DOM with character-specific data
  charImg.src          = char.portrait;
  charImg.alt          = char.portraitAlt;
  charNametag.textContent = char.nametag;
  locationEl.textContent  = char.location;
  relLabelEl.textContent  = char.relLabel;
  loadLabel.textContent   = char.loadingLabel;
  speakerEl.textContent   = char.speakerName;
  exprEl.textContent      = char.defaultExpr;
  plantEl.textContent     = char.plantEmoji;

  // Update shelf items
  shelfEl.innerHTML = '';
  char.shelfItems.forEach(item => {
    const div = document.createElement('div');
    div.className = 'shelf-item';
    div.textContent = item;
    shelfEl.appendChild(div);
  });

  // Update win screen text
  winTitleEl.textContent   = char.winTitle;
  winSubEl.textContent     = char.winSubtitle;
  winQuoteEl.textContent   = char.winQuote;
  winEmojiEl.textContent   = char.winEmoji;

  // Apply character theme to game container
  gameEl.dataset.char = key;

  // Reset relationship bar
  relFill.style.width    = '0%';
  relScore.textContent   = '0 / 100';
  relTier.textContent    = 'ACQUAINTANCE';
  relTier.style.color    = '#6b8cae';
  winScreen.classList.remove('show');

  // Hide character select, start game
  charSelect.classList.remove('show');
  charSelect.style.pointerEvents = 'none';
  fetchNextScene();
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
  if (!activeChar) return;
  setLoading(true);

  const systemPrompt = activeChar.systemPrompt
    .replace('{RELATIONSHIP_LEVEL}', relationship)
    .replace('{TIER}', getTierName(relationship));

  if (conversationHistory.length === 0) {
    conversationHistory.push({
      role: 'user',
      content: activeChar.initialPrompt
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
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(`${response.status}: ${data.error?.message || JSON.stringify(data)}`);

    const raw = data.choices?.[0]?.message?.content || '';
    if (!raw) {
      const reason = data.choices?.[0]?.finish_reason || 'unknown';
      throw new Error(`Empty response from model (finish_reason: ${reason})`);
    }
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error(`No JSON in response. Raw: ${raw.substring(0, 120)}`);

    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.dialogue || !parsed.choices?.length) throw new Error('Bad response structure');

    conversationHistory.push({ role: 'assistant', content: parsed.dialogue });
    speakerEl.textContent = activeChar.speakerName;
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
      speakerEl.textContent = activeChar?.speakerName || 'UNKNOWN';
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
  exprEl.textContent = s.expression || activeChar?.defaultExpr || '😊';

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
  const isVex = activeChar?.key === 'vex';
  const pool = isVex
    ? ['💜','🖤','✨','💫','⭐','💎']
    : ['💖','💗','💓','🌸','✨','💝'];
  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      const h = document.createElement('div');
      h.className = 'float-heart';
      h.textContent = pool[Math.floor(Math.random() * pool.length)];
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
  winScreen.classList.remove('show');
  activeChar = null;
  relationship = 0;
  conversationHistory = [];
  relFill.style.width  = '0%';
  relScore.textContent = '0 / 100';
  relTier.textContent  = 'ACQUAINTANCE';
  relTier.style.color  = '#6b8cae';
  gameEl.dataset.char  = '';
  charSelect.classList.add('show');
  charSelect.style.pointerEvents = 'auto';
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
// Show character select on load
charSelect.classList.add('show');
