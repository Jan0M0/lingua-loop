// 录音封装：MediaRecorder，仅本地存储，用户可随时删除。
export interface RecorderHandle {
  stop(): Promise<Blob>
  cancel(): void
}

export function recordingSupported(): boolean {
  return typeof window !== 'undefined' && typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia
}

export async function startRecording(): Promise<RecorderHandle> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : ''
  const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
  const chunks: Blob[] = []
  rec.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }
  rec.start(250)
  return {
    stop: () =>
      new Promise<Blob>((resolve) => {
        rec.onstop = () => {
          stream.getTracks().forEach((t) => t.stop())
          resolve(new Blob(chunks, { type: mime || 'audio/webm' }))
        }
        rec.stop()
      }),
    cancel: () => {
      try { rec.stop() } catch { /* ignore */ }
      stream.getTracks().forEach((t) => t.stop())
    },
  }
}
