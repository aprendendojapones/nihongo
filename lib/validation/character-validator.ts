
/**
 * Character Validator
 * Shared logic for validating keyboard input and OCR results
 */

// Common Romaji variations (Hepburn vs Kunrei-shiki vs others)
const ROMAJI_ALIASES: Record<string, string[]> = {
    'shu': ['syu'],
    'sho': ['syo'],
    'sha': ['sya'],
    'chu': ['tyu', 'cyu'],
    'cho': ['tyo', 'cyo'],
    'cha': ['tya', 'cya'],
    'ju': ['jyu', 'zyu'],
    'jo': ['jyo', 'zyo'],
    'ja': ['jya', 'zya'],
    'fu': ['hu'],
    'tsu': ['tu'],
    'chi': ['ti'],
    'shi': ['si'],
    'ji': ['zi'],
    // Add more as needed
};

// Character type definition
export type CharacterType = 'hiragana' | 'katakana' | 'romaji' | 'kanji';

export function validateCharacter(
    input: string,
    target: string,
    type: CharacterType = 'hiragana'
): boolean {
    if (!input || !target) return false;

    // Normalize inputs
    const normalizedInput = input.trim();
    const normalizedTarget = target.trim();

    // 1. Exact match (most common and fastest)
    if (normalizedInput === normalizedTarget) return true;

    // 2. Case insensitive for Romaji
    if (type === 'romaji') {
        const lowerInput = normalizedInput.toLowerCase();
        const lowerTarget = normalizedTarget.toLowerCase();
        
        if (lowerInput === lowerTarget) return true;

        // Check aliases/variations
        const aliases = ROMAJI_ALIASES[lowerTarget];
        if (aliases && aliases.includes(lowerInput)) return true;
        
        // Check long vowels (macrons) - Simple logic: 'ou' ~ 'ō'
        // This can be expanded
        const targetWithMacrons = lowerTarget
            .replace(/ou/g, 'ō')
            .replace(/uu/g, 'ū')
            .replace(/aa/g, 'ā')
            .replace(/ii/g, 'ī')
            .replace(/ee/g, 'ē');
            
        if (lowerInput === targetWithMacrons) return true;
    }

    // 3. OCR robustness (Japanese characters)
    // Sometimes OCR returns surrounding noise.
    // However, for STRICT typing validation, we might not want contains.
    // But for this function (shared), we can add a flag or just assume strict if not specified.
    // Let's keep it strict for typing.
    
    return false;
}

/**
 * Validate OCR Result (more lenient)
 */
export function validateOCRResult(
    recognizedText: string,
    target: string
): boolean {
    if (!recognizedText || !target) return false;

    const normalizedRecognized = recognizedText.trim();
    const normalizedTarget = target.trim();

    // Direct match
    if (normalizedRecognized === normalizedTarget) return true;

    // Contains match (OCR often includes noise or multiple chars)
    // E.g. OCR might see "あ." or " あ "
    if (normalizedRecognized.includes(normalizedTarget)) return true;

    // Romaji case-insensitive check (if target looks like romaji)
    if (/^[a-zA-Z]+$/.test(normalizedTarget)) {
        return validateCharacter(normalizedRecognized, normalizedTarget, 'romaji');
    }

    return false;
}
