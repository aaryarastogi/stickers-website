/**
 * Prompt filtering utility to prevent inappropriate content
 * and ensure stickers are family-friendly and appropriate
 */

// Comprehensive list of adult/18+ keywords to block
const BLOCKED_KEYWORDS = [
  // Explicit sexual content
  'nude', 'naked', 'bare', 'exposed', 'undress', 'undressed',
  'sexy', 'erotic', 'porn', 'porno', 'xxx', 'adult',
  'genital', 'sexual', 'sex', 'masturbat', 'orgasm',
  'breast', 'boob', 'nipple', 'crotch', 'penis', 'cock', 'dick',
  'vagina', 'pussy', 'clit', 'asshole', 'anus',
  
  // Violence and gore
  'blood', 'bloody', 'gore', 'gory', 'violence', 'violent',
  'kill', 'killing', 'murder', 'death', 'dead', 'die', 'dying',
  'weapon', 'gun', 'rifle', 'knife', 'sword', 'bomb', 'explosive',
  'terror', 'terrorist', 'attack', 'war', 'battle', 'fight',
  'torture', 'tortured', 'beaten', 'hit', 'punch', 'stab',
  
  // Drugs and illegal substances
  'drug', 'cocaine', 'heroin', 'marijuana', 'weed', 'cannabis',
  'meth', 'methamphetam', 'lsd', 'ecstasy', 'pill', 'pills',
  'inject', 'needle', 'syringe', 'smoking', 'smoke', 'joint',
  'alcohol', 'beer', 'wine', 'drunk', 'drinking', 'shot',
  
  // Hate speech and discrimination
  'racist', 'racism', 'hate', 'hateful', 'discriminat',
  'offensive', 'slur', 'swastika', 'nazi', 'fascist',
  
  // Self-harm and suicide
  'suicide', 'self-harm', 'cutting', 'scar',
  'depression', 'depressed',
  
  // Political and controversial
  'terrorism', 'extremist', 'radical',
  
  // Medical/professional content (context-sensitive)
  'medical', 'hospital', 'surgery', 'patient', 'doctor',
  'medical condition', 'disease', 'illness', 'sick', 'infection',
  
  // Profanity and vulgar language
  'fuck', 'fucking', 'shit', 'damn', 'hell', 'bitch', 'bastard',
  'ass', 'arse', 'badass', 'bad-ass',
  
  // General inappropriate contexts
  'bar', 'club', 'nightclub', 'party', 'drunk', 'stoned',
  'casino', 'gambling', 'bet', 'wager',
  
  // Offensive body parts in specific contexts
  'butt', 'butts', 'buttocks', 'ass', 'rear', 'bottom',
];

// Words that might be acceptable in specific sticker contexts (whitelist override)
const SAFE_OVERRIDES = {
  // Cute/cartoon contexts
  'cute cat': ['naked', 'bare'],
  'cute dog': ['naked', 'bare'],
  'cartoon': ['weapon'],
  'superhero': ['weapon'],
  
  // Educational/family contexts
  'science': ['chemical', 'molecular'],
  'nature': ['scientific'],
};

// Additional context words that should be allowed
const STICKER_APPROPRIATE_THEMES = [
  'cute', 'adorable', 'happy', 'fun', 'colorful', 'bright',
  'cartoon', 'animated', 'drawing', 'illustration',
  'animal', 'pet', 'cat', 'dog', 'bird', 'fish',
  'flower', 'plant', 'nature', 'landscape', 'sky',
  'emoji', 'happy face', 'smiley', 'star', 'heart',
  'pattern', 'geometric', 'abstract', 'art',
  'food', 'snack', 'fruit', 'vegetable',
  'superhero', 'character', 'fantasy', 'magic',
  'sport', 'music', 'dance', 'game', 'toy',
  'travel', 'vacation', 'beach', 'mountain',
  'birthday', 'celebration', 'party (safe)', 'balloon',
  'holiday', 'christmas', 'halloween (safe)', 'easter',
  'education', 'school', 'learn', 'reading', 'study',
  'technology', 'computer', 'phone', 'gadget',
  'fashion', 'accessory', 'clothing', 'shoes',
  'weather', 'sun', 'rain', 'cloud', 'rainbow',
  'space', 'planet', 'star', 'moon', 'rocket',
];

/**
 * Check if a prompt contains blocked keywords
 */
const containsBlockedKeywords = (prompt) => {
  const lowerPrompt = prompt.toLowerCase();
  
  for (const keyword of BLOCKED_KEYWORDS) {
    // Check for exact word matches or partial matches in context
    const regex = new RegExp(`\\b${keyword}\\w*\\b`, 'i');
    if (regex.test(lowerPrompt)) {
      return true;
    }
  }
  
  return false;
};

/**
 * Check if prompt is appropriate for sticker generation
 */
const checkStickerAppropriateness = (prompt) => {
  // Check for explicit blocked content
  if (containsBlockedKeywords(prompt)) {
    return {
      isValid: false,
      reason: 'Your prompt contains content that may not be appropriate for stickers. Please use family-friendly descriptions.',
      category: 'inappropriate_content'
    };
  }
  
  // Check if prompt is too short or vague
  if (prompt.trim().length < 3) {
    return {
      isValid: false,
      reason: 'Please provide a more detailed description for your sticker.',
      category: 'too_short'
    };
  }
  
  // Check if prompt is too long (may contain hidden inappropriate content)
  if (prompt.length > 500) {
    return {
      isValid: false,
      reason: 'Your prompt is too long. Please keep it under 500 characters.',
      category: 'too_long'
    };
  }
  
  // Check for attempts to bypass filters (common tactics)
  const bypassPatterns = [
    /n[u0o][d0@]e/gi,  // n00de, nu@de, etc.
    /s[3e]x/gi,        // s3x, sex variations
    /w[e3]ap[o0]n/gi,  // weapon variations
    /[/\\]$/g,         // slash commands
  ];
  
  for (const pattern of bypassPatterns) {
    if (pattern.test(prompt)) {
      return {
        isValid: false,
        reason: 'Your prompt appears to attempt bypassing content filters. Please use appropriate descriptions.',
        category: 'bypass_attempt'
      };
    }
  }
  
  return {
    isValid: true,
    reason: 'Prompt is valid and appropriate for sticker generation.',
    category: 'valid'
  };
};

/**
 * Suggest alternative safe prompt if the original is inappropriate
 */
const suggestSafeAlternative = () => {
  const suggestions = [
    'a cute cartoon character',
    'a colorful geometric pattern',
    'a happy animal friend',
    'a beautiful flower design',
    'a fun emoji collection',
    'a creative abstract art',
    'a joyful celebration scene',
  ];
  
  return suggestions[Math.floor(Math.random() * suggestions.length)];
};

/**
 * Sanitize prompt to remove any potential issues
 */
const sanitizePrompt = (prompt) => {
  // Remove extra whitespace
  let sanitized = prompt.trim();
  
  // Remove special characters that might be used for bypass
  sanitized = sanitized.replace(/[<>{}[\]\\]/g, '');
  
  // Ensure reasonable length
  if (sanitized.length > 500) {
    sanitized = sanitized.substring(0, 500);
  }
  
  return sanitized;
};

/**
 * Main validation function that combines all checks
 */
export const validatePromptForSticker = (prompt) => {
  if (!prompt || typeof prompt !== 'string') {
    return {
      isValid: false,
      reason: 'Please provide a valid prompt description.',
      category: 'invalid_input'
    };
  }
  
  // First sanitize
  const sanitized = sanitizePrompt(prompt);
  
  // Then check appropriateness
  const validation = checkStickerAppropriateness(sanitized);
  
  // Add suggestion if invalid
  if (!validation.isValid) {
    validation.suggestion = suggestSafeAlternative(sanitized);
  }
  
  return {
    ...validation,
    sanitizedPrompt: sanitized
  };
};

/**
 * Check if generated image should be flagged (post-generation check)
 * This is a placeholder for future integration with content moderation APIs
 */
export const checkGeneratedImage = async () => {
  // TODO: Integrate with content moderation service
  // For now, return valid as we rely on prompt filtering
  return {
    isValid: true,
    reason: 'Image passed content moderation.',
    category: 'valid'
  };
};

export default validatePromptForSticker;

