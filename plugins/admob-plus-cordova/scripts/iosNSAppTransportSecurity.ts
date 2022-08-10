import type { Context } from 'cordova-ts-hook'
import plist, { PlistObject } from 'plist'
import { enhanceContext, EnhancedContext, updateTextFile } from './util'

async function iosSetNSAppTransportSecurity(ctx: EnhancedContext) {
  await updateTextFile(ctx.ios!.plistPath, (content) => {
    if (content.indexOf('NSAllowsArbitraryLoadsInWebContent') > -1) {
      return
    }

    const plistObj = plist.parse(content) as {
      NSAppTransportSecurity: PlistObject
    }

    Object.assign(plistObj, {
      NSAppTransportSecurity: {
        ...plistObj.NSAppTransportSecurity,
        NSAllowsArbitraryLoads: true,
        NSAllowsArbitraryLoadsForMedia: true,
        NSAllowsArbitraryLoadsInWebContent: true,
      },
    })

    return plist.build(plistObj)
  })
}

export = async (context: Context) => {
  const ctx = await enhanceContext(context)
  if (ctx.opts.cordova.platforms.includes('ios')) {
    await iosSetNSAppTransportSecurity(ctx)
  }
}
