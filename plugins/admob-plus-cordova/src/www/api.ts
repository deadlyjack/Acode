import { execAsync, NativeActions } from './generated'

export { execAsync, AdSizeType, Events, NativeActions } from './generated'

/** @internal */
export type MobileAdOptions = {
  id?: number
  adUnitId: string
  contentUrl?: string
  keywords?: string[]
  npa?: '1'
}

let started = false
let startPromise: Promise<{ version: string }> | null = null

/** @internal */
export async function start() {
  startPromise = execAsync(NativeActions.start) as Promise<{ version: string }>
  const result = await startPromise
  started = true
  return result
}

/** @internal */
export class MobileAd<T extends MobileAdOptions = MobileAdOptions> {
  public static readonly type: string = ''

  private static allAds: { [s: number]: MobileAd } = {}
  private static idCounter = 0

  public readonly id: number

  protected readonly opts: T
  private _created = false
  private _init: Promise<any> | null = null

  constructor(opts: T) {
    this.opts = opts

    this.id = opts.id ?? MobileAd.nextId()
    MobileAd.allAds[this.id] = this
  }

  public static getAdById(id: number) {
    return this.allAds[id]
  }

  private static nextId() {
    const storage = window.localStorage
    const key = 'admob-ad-id-counter'
    const value = storage.getItem(key)
    if (value !== null) {
      MobileAd.idCounter = Number(value)
    }
    MobileAd.idCounter += 1
    storage.setItem(key, `${MobileAd.idCounter}`)
    return MobileAd.idCounter
  }

  public get adUnitId() {
    return this.opts.adUnitId
  }

  public on(...args: Parameters<typeof document.addEventListener>): () => void {
    const [eventName, cb, ...rest] = args
    const type = `admob.ad.${eventName.toLowerCase()}`
    const listener = (evt: any) => {
      if (evt.ad === this) {
        cb(evt)
      }
    }
    document.addEventListener(type, listener, ...rest)

    return () => {
      document.removeEventListener(type, listener, ...rest)
    }
  }

  protected async isLoaded() {
    await this.init()
    return execAsync(NativeActions.adIsLoaded, [
      { id: this.id },
    ]) as Promise<boolean>
  }

  protected async load() {
    await this.init()
    // TODO read `opts` in native code?
    await execAsync(NativeActions.adLoad, [{ ...this.opts, id: this.id }])
  }

  protected async show(opts?: Record<string, any>) {
    await this.init()
    return execAsync(NativeActions.adShow, [{ ...opts, id: this.id }])
  }

  protected async hide() {
    return execAsync(NativeActions.adHide, [{ id: this.id }])
  }

  protected async init() {
    if (this._created) return

    if (!started) {
      if (startPromise === null) start()
      await startPromise
    }

    if (this._init === null) {
      const cls =
        (this.constructor as unknown as { cls?: string }).cls ??
        this.constructor.name

      this._init = execAsync(NativeActions.adCreate, [
        { ...this.opts, id: this.id, cls },
      ])
    }

    await this._init
    this._created = true
  }
}

export enum MaxAdContentRating {
  G = 'G',
  MA = 'MA',
  PG = 'PG',
  T = 'T',
  UNSPECIFIED = '',
}

export type RequestConfig = {
  maxAdContentRating?: MaxAdContentRating
  sameAppKey?: boolean,
  tagForChildDirectedTreatment?: boolean | null
  tagForUnderAgeOfConsent?: boolean | null
  testDeviceIds?: string[]
}

export const enum Platforms {
  android = 'android',
  ios = 'ios',
}

export enum TrackingAuthorizationStatus {
  notDetermined = 0,
  restricted = 1,
  denied = 2,
  authorized = 3,
}

export type AdMobConfig = {
  appMuted?: boolean
  appVolume?: number
} & RequestConfig
