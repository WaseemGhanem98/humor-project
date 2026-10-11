// Unit tests for model-output parsing and text cleaning. Run: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cleanText, MemeError, parseMemeOutput, TOPIC_MAX, CAPTION_MAX } from '../lib/meme-output.ts'

const stock = [{ id: 1 }, { id: 2 }, { id: 3 }]
const out = (o: object) => JSON.stringify({ caption: 'A joke', image_id: 2, refused: false, ...o })

test('cleanText strips control chars, zero-width chars and angle brackets', () => {
  assert.equal(cleanText('  Monday\u0000 <b>standups</b>​  '), 'Monday b standups /b')
})

test('cleanText caps topics at TOPIC_MAX', () => {
  assert.equal(cleanText('x'.repeat(200)).length, TOPIC_MAX)
  assert.equal(cleanText('y'.repeat(80)).length, 80)
})

test('valid output keeps the chosen image', () => {
  const r = parseMemeOutput(out({}), stock)
  assert.equal(r.caption, 'A joke')
  assert.equal(r.image.id, 2)
})

test('surrounding quotes are removed and long captions are capped', () => {
  assert.equal(parseMemeOutput(out({ caption: '“Quoted joke”' }), stock).caption, 'Quoted joke')
  assert.equal(parseMemeOutput(out({ caption: 'z'.repeat(500) }), stock).caption.length, CAPTION_MAX)
})

test('quotes inside the joke are kept', () => {
  const c = 'Everyone contributed a heartfelt “thanks.”'
  assert.equal(parseMemeOutput(out({ caption: c }), stock).caption, c)
  assert.equal(parseMemeOutput(out({ caption: 'He said "fine"' }), stock).caption, 'He said "fine"')
  assert.equal(parseMemeOutput(out({ caption: '"Hi," she said, "no."' }), stock).caption, '"Hi," she said, "no."')
})

test('unknown image id falls back to a stock image that was not used recently', () => {
  for (let i = 0; i < 20; i++) {
    const r = parseMemeOutput(out({ image_id: 999 }), stock, [1, 2])
    assert.equal(r.image.id, 3)
  }
})

test('refusal becomes a user-facing MemeError', () => {
  assert.throws(() => parseMemeOutput(out({ refused: true }), stock), MemeError)
})

test('invalid JSON, missing caption and empty caption are internal errors', () => {
  for (const bad of ['not json', '{}', out({ caption: '  ' }), out({ caption: 42 })]) {
    assert.throws(() => parseMemeOutput(bad, stock), (e: Error) => !(e instanceof MemeError))
  }
})

test('empty stock library is an error', () => {
  assert.throws(() => parseMemeOutput(out({}), []))
})
