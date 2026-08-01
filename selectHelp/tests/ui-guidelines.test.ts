import { readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'
import { describe, expect, it } from 'vitest'

const miniProgramRoot = join(process.cwd(), 'miniprogram')

function collectFiles(dir: string, extensions: string[]): string[] {
  return readdirSync(dir).flatMap((name) => {
    const file = join(dir, name)
    return statSync(file).isDirectory()
      ? collectFiles(file, extensions)
      : extensions.includes(extname(file))
        ? [file]
        : []
  })
}

const wxmlFiles = collectFiles(miniProgramRoot, ['.wxml'])
const wxssFiles = collectFiles(miniProgramRoot, ['.wxss'])

describe('UI guideline guardrails', () => {
  it('does not use transition: all', () => {
    for (const file of wxssFiles) {
      expect(readFileSync(file, 'utf8'), file).not.toMatch(/transition\s*:\s*all\b/i)
    }
  })

  it('does not attach tap handlers directly to text nodes', () => {
    for (const file of wxmlFiles) {
      expect(readFileSync(file, 'utf8'), file).not.toMatch(/<text\b[^>]*(?:bindtap|catchtap)=/i)
    }
  })

  it('gives editable controls an accessible label', () => {
    for (const file of wxmlFiles) {
      const controls = readFileSync(file, 'utf8').match(/<(?:input|textarea|slider)\b[^>]*>/gi) ?? []
      for (const control of controls) {
        expect(control, `${file}: ${control}`).toMatch(/aria-label="[^"]+"/i)
      }
    }
  })

  it('uses the accessible minimum text token', () => {
    const appStyles = readFileSync(join(miniProgramRoot, 'app.wxss'), 'utf8')
    expect(appStyles).toContain('--font-size-xs: 24rpx;')
  })
})
