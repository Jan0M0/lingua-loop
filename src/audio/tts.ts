// 系统 TTS 封装：只在浏览器有可用语音时工作；失败或无语音时 UI 提供文本替代。
export interface TtsCapability {
  supported: boolean
  voices: SpeechSynthesisVoice[]
  enVoice: SpeechSynthesisVoice | null
  esVoice: SpeechSynthesisVoice | null
}

export function ttsCapability(): TtsCapability {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return { supported: false, voices: [], enVoice: null, esVoice: null }
  }
  const voices = window.speechSynthesis.getVoices()
  const pick = (langs: string[]) =>
    voices.find((v) => langs.some((l) => v.lang.toLowerCase().startsWith(l))) ?? null
  return {
    supported: true,
    voices,
    enVoice: pick(['en-gb', 'en-us', 'en']),
    esVoice: pick(['es-es', 'es-mx', 'es-us', 'es']),
  }
}

export function speak(
  text: string,
  lang: 'en' | 'es',
  opts: { rate?: number; voice?: SpeechSynthesisVoice | null; onEnd?: () => void } = {}
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false
  try {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    const cap = ttsCapability()
    u.lang = lang === 'en' ? 'en-GB' : 'es-ES'
    u.voice = (opts.voice ?? (lang === 'en' ? cap.enVoice : cap.esVoice)) as SpeechSynthesisVoice
    u.rate = opts.rate ?? (lang === 'en' ? 1.0 : 0.9)
    if (opts.onEnd) u.onend = opts.onEnd
    window.speechSynthesis.speak(u)
    return true
  } catch {
    return false
  }
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel()
}

/** 逐行朗读脚本；双说话人尽力用两种语音区分，不可用则单语音 */
export function speakScriptLines(
  lines: { speaker: string; line: string }[],
  lang: 'en' | 'es',
  opts: { rate?: number; from?: number; onLine?: (i: number) => void; onDone?: () => void } = {}
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false
  const cap = ttsCapability()
  const primary = lang === 'en' ? cap.enVoice : cap.esVoice
  const alt =
    cap.voices.find((v) =>
      v !== primary &&
      v.lang.toLowerCase().startsWith(lang === 'en' ? 'en' : 'es') &&
      v.name !== primary?.name
    ) ?? primary
  const speakers = [...new Set(lines.map((l) => l.speaker))]
  const voiceOf = (speaker: string) => (speakers.indexOf(speaker) % 2 === 0 ? primary : alt)

  let idx = opts.from ?? 0
  const speakNext = () => {
    if (idx >= lines.length) {
      opts.onDone?.()
      return
    }
    const line = lines[idx]
    opts.onLine?.(idx)
    const u = new SpeechSynthesisUtterance(line.line)
    u.lang = lang === 'en' ? 'en-GB' : 'es-ES'
    const v = voiceOf(line.speaker)
    if (v) u.voice = v
    if (v === alt && alt !== primary) u.pitch = 1.15
    u.rate = opts.rate ?? 0.95
    u.onend = () => { idx += 1; speakNext() }
    u.onerror = () => { idx += 1; speakNext() }
    window.speechSynthesis.speak(u)
  }
  window.speechSynthesis.cancel()
  speakNext()
  return true
}
