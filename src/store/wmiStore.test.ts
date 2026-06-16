// @vitest-environment jsdom
import { beforeEach, describe, expect, test } from 'vitest'
import { useWmiStore } from './wmiStore'

describe('wmiStore learnMode', () => {
  beforeEach(() => {
    useWmiStore.setState({ activeChildKey: null, learnMode: 'wmi', learnModeByChild: {} })
  })

  test('defaults to wmi, pins per child, resolves on sync', () => {
    useWmiStore.getState().syncChildGrade('childA', 1)
    expect(useWmiStore.getState().learnMode).toBe('wmi')

    useWmiStore.getState().setLearnMode('video')
    expect(useWmiStore.getState().learnMode).toBe('video')

    // a fresh child resolves to the default
    useWmiStore.getState().syncChildGrade('childB', 1)
    expect(useWmiStore.getState().learnMode).toBe('wmi')

    // returning to childA restores its pinned mode
    useWmiStore.getState().syncChildGrade('childA', 1)
    expect(useWmiStore.getState().learnMode).toBe('video')
  })
})
