import { describe, test, expect } from 'vitest'
import { parseAnswerKey } from './answerKey.js'

const MD = `Logical Reasoning /數 學 思 維 能 力

<table><tr><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td></tr><tr><td>B</td><td>B</td><td>D</td><td>A</td><td>C</td></tr></table>

<table><tr><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td></tr><tr><td>C</td><td>D</td><td>B</td><td>B</td><td>C</td></tr></table>

<table><tr><td>11</td><td>12</td><td>13</td><td>14</td><td>15</td></tr><tr><td>C</td><td>C</td><td>A</td><td>D</td><td>C</td></tr></table>

Applications /數 學 應 用 能 力

<table><tr><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td></tr><tr><td>240</td><td>15</td><td>13</td><td>33</td><td>23</td></tr></table>

<table><tr><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td></tr><tr><td>6</td><td>20</td><td>527</td><td>2134</td><td>2211</td></tr></table>`

describe('parseAnswerKey', () => {
  test('parses both sections into number→answer maps', () => {
    const key = parseAnswerKey(MD)
    expect(Object.keys(key.reasoning)).toHaveLength(15)
    expect(Object.keys(key.applications)).toHaveLength(10)
    expect(key.reasoning[1]).toBe('B')
    expect(key.reasoning[15]).toBe('C')
    expect(key.applications[1]).toBe('240')
    expect(key.applications[10]).toBe('2211')
  })
})
