type SfxName = 'eat' | 'bomb' | 'win' | 'lose' | 'shoot' | 'hit' | 'coin' | 'dash'

let ctx: AudioContext | null = null

function getCtx() {
  if (typeof window === 'undefined') return null
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  if (!ctx) ctx = new AC()
  return ctx
}

/** Call once on user gesture so mobile browsers unlock audio. */
export function unlockAudio() {
  const audio = getCtx()
  if (!audio) return
  if (audio.state === 'suspended') void audio.resume()
}

function tone(
  audio: AudioContext,
  {
    freq,
    duration,
    type = 'sine',
    gain = 0.08,
    slideTo,
    when = 0,
  }: {
    freq: number
    duration: number
    type?: OscillatorType
    gain?: number
    slideTo?: number
    when?: number
  },
) {
  const t0 = audio.currentTime + when
  const osc = audio.createOscillator()
  const g = audio.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (slideTo != null) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + duration)
  }
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.015)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(g)
  g.connect(audio.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
}

export function playSfx(name: SfxName) {
  const audio = getCtx()
  if (!audio) return
  if (audio.state === 'suspended') void audio.resume()

  if (name === 'eat') {
    tone(audio, { freq: 620, duration: 0.07, type: 'triangle', gain: 0.06 })
    tone(audio, { freq: 880, duration: 0.09, type: 'sine', gain: 0.05, when: 0.04 })
    return
  }

  if (name === 'bomb') {
    tone(audio, { freq: 180, duration: 0.22, type: 'sawtooth', gain: 0.07, slideTo: 55 })
    tone(audio, { freq: 90, duration: 0.28, type: 'square', gain: 0.04, slideTo: 40, when: 0.02 })
    return
  }

  if (name === 'shoot') {
    tone(audio, { freq: 880, duration: 0.06, type: 'square', gain: 0.035, slideTo: 420 })
    return
  }

  if (name === 'hit') {
    tone(audio, { freq: 240, duration: 0.1, type: 'sawtooth', gain: 0.05, slideTo: 120 })
    return
  }

  if (name === 'coin') {
    tone(audio, { freq: 980, duration: 0.07, type: 'sine', gain: 0.05 })
    tone(audio, { freq: 1320, duration: 0.1, type: 'triangle', gain: 0.04, when: 0.05 })
    return
  }

  if (name === 'dash') {
    tone(audio, { freq: 400, duration: 0.08, type: 'triangle', gain: 0.04, slideTo: 700 })
    return
  }

  if (name === 'win') {
    ;[523, 659, 784, 1046].forEach((freq, i) => {
      tone(audio, { freq, duration: 0.16, type: 'triangle', gain: 0.055, when: i * 0.1 })
    })
    return
  }

  ;[300, 220, 160].forEach((freq, i) => {
    tone(audio, {
      freq,
      duration: 0.18,
      type: 'sawtooth',
      gain: 0.045,
      slideTo: freq - 40,
      when: i * 0.12,
    })
  })
}
