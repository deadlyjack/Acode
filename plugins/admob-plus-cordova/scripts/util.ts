import path from 'path'
import glob from 'fast-glob'
import type { Context } from 'cordova-ts-hook'
import fse from 'fs-extra'

export interface EnhancedContext extends Context {
  ios?: {
    plistPath: string
    rootDir: typeof path.join
  }
}

export async function enhanceContext(
  context: Context,
): Promise<EnhancedContext> {
  const ctx: EnhancedContext = context
  const { projectRoot } = context.opts

  if (context.opts.cordova.platforms.includes('ios')) {
    const plistPath = await glob('*/*-Info.plist', {
      cwd: path.join(projectRoot, 'platforms/ios'),
      onlyFiles: true,
      absolute: true,
    }).then((files) => files[0])

    ctx.ios = {
      plistPath,
      rootDir: (...args) => path.join(plistPath, '..', ...args),
    }
  }

  return ctx
}

export async function updateTextFile(
  filename: string,
  update: (context: string) => string | undefined,
) {
  const content = await fse.readFile(filename, 'utf8')
  const contextUpdated = update(content)
  if (contextUpdated === undefined || contextUpdated === content) return

  await fse.writeFile(filename, contextUpdated)
}
