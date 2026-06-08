import { describe, test, expect } from 'vitest'
import { buildUnitConvertSteps } from './unitConvertSteps'

describe('buildUnitConvertSteps', () => {
  test('m-cm: factor 100, answer = big*100 + small', () => {
    const sb = buildUnitConvertSteps('m-cm', 3, 40, 'en')
    expect(sb.factor).toBe(100)
    expect(sb.answer).toBe(340)
    expect(sb.bigU).toBe('m')
    expect(sb.smallU).toBe('cm')
  })

  test('kg-g: factor 1000, answer = big*1000 + small', () => {
    const sb = buildUnitConvertSteps('kg-g', 2, 500, 'en')
    expect(sb.factor).toBe(1000)
    expect(sb.answer).toBe(2500)
    expect(sb.bigU).toBe('kg')
    expect(sb.smallU).toBe('g')
  })

  test('dollar-cent: factor 100, answer = big*100 + small', () => {
    const sb = buildUnitConvertSteps('dollar-cent', 5, 75, 'en')
    expect(sb.factor).toBe(100)
    expect(sb.answer).toBe(575)
    expect(sb.bigU).toBe('dollar')
    expect(sb.smallU).toBe('cent')
  })

  test('always produces exactly 4 steps', () => {
    const sb = buildUnitConvertSteps('m-cm', 3, 40, 'en')
    expect(sb.steps).toHaveLength(4)
    expect(sb.finalIndex).toBe(3)
  })

  test('phases are setup -> rule -> compute -> result', () => {
    const sb = buildUnitConvertSteps('kg-g', 2, 500, 'en')
    expect(sb.steps.map((s) => s.phase)).toEqual(['setup', 'rule', 'compute', 'result'])
  })

  test('last step has result:true and contains the answer in caption', () => {
    const sb = buildUnitConvertSteps('m-cm', 3, 40, 'en')
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.caption).toContain('340')
  })

  test('last step result:true for kg-g with answer in caption', () => {
    const sb = buildUnitConvertSteps('kg-g', 2, 500, 'en')
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.caption).toContain('2500')
  })

  test('only the last step has result:true', () => {
    const sb = buildUnitConvertSteps('dollar-cent', 5, 75, 'en')
    const results = sb.steps.map((s) => s.result)
    expect(results).toEqual([false, false, false, true])
  })

  test('language switch: ID captions use Indonesian words', () => {
    const sbId = buildUnitConvertSteps('m-cm', 3, 40, 'id')
    expect(sbId.steps[0].caption).toContain('Ubah')
    expect(sbId.steps[2].caption).toContain('lalu')
    expect(sbId.bigU).toBe('meter')
    expect(sbId.smallU).toBe('cm')
  })

  test('language switch: kg-g ID uses gram', () => {
    const sbId = buildUnitConvertSteps('kg-g', 2, 500, 'id')
    expect(sbId.bigU).toBe('kg')
    expect(sbId.smallU).toBe('gram')
  })

  test('language switch: dollar-cent ID uses dolar/sen', () => {
    const sbId = buildUnitConvertSteps('dollar-cent', 5, 75, 'id')
    expect(sbId.bigU).toBe('dolar')
    expect(sbId.smallU).toBe('sen')
  })

  test('rule step contains factor for all modes', () => {
    expect(buildUnitConvertSteps('m-cm', 1, 0, 'en').steps[1].caption).toContain('100')
    expect(buildUnitConvertSteps('kg-g', 1, 0, 'en').steps[1].caption).toContain('1000')
    expect(buildUnitConvertSteps('dollar-cent', 1, 0, 'en').steps[1].caption).toContain('100')
  })

  test('compute step contains big*factor intermediate result', () => {
    const sb = buildUnitConvertSteps('m-cm', 3, 40, 'en')
    // big(3) × factor(100) = 300, then + 40
    expect(sb.steps[2].caption).toContain('300')
    expect(sb.steps[2].caption).toContain('40')
  })

  test('finalIndex is always steps.length - 1', () => {
    const sb = buildUnitConvertSteps('kg-g', 7, 200, 'en')
    expect(sb.finalIndex).toBe(sb.steps.length - 1)
  })
})
