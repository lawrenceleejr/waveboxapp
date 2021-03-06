import Bootstrap from 'R/Bootstrap'
import { ANALYTICS_HEARTBEAT_INTERVAL } from 'shared/constants'
import { userStore } from 'stores/user'
import { mailboxStore } from 'stores/mailbox'
import querystring from 'querystring'
import os from 'os'
const pkg = window.appPackage()

class Analytics {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this.heartbeatTO = null
    this.platformInfoString = [
      process.platform,
      process.arch,
      os.release()
    ].join(',')
    this._boundFunctions = {
      appHashChanged: this.appHashChanged.bind(this)
    }
  }

  /* ****************************************************************************/
  // Autoreporting
  /* ****************************************************************************/

  /**
  * Starts auto reporting
  * @return self
  */
  startAutoreporting () {
    this.stopAutoreporting()
    this.heartbeatTO = setInterval(() => {
      this.appHeartbeat()
    }, ANALYTICS_HEARTBEAT_INTERVAL)
    window.addEventListener('hashchange', this._boundFunctions.appHashChanged, false)
    this.appOpened()
  }

  /**
  * Stops auto reporting
  * @return self
  */
  stopAutoreporting () {
    clearTimeout(this.heartbeatTO)
    window.removeEventListener('hashchange', this._boundFunctions.appHashChanged)
  }

  /* ****************************************************************************/
  // Events
  /* ****************************************************************************/

  /**
  * Sends an analytics report.
  * https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters
  * @param window: the mailbox window
  * @param args: the items to append
  * @return promise
  */
  send (args) {
    if (!Bootstrap.credentials.GOOGLE_ANALYTICS_ID) { return Promise.resolve() }

    const userState = userStore.getState()
    const mailboxState = mailboxStore.getState()

    const fullArgs = Object.assign({
      v: 1,
      tid: Bootstrap.credentials.GOOGLE_ANALYTICS_ID,
      cid: userState.analyticsId,
      cd: window.location.hash,
      cd1: mailboxState.mailboxCount(),
      cd3: userState.user.plan,
      cd4: this.platformInfoString,
      cd5: window.navigator.userAgent,
      t: 'screenview',
      vp: `${window.outerWidth}x${window.outerHeight}`,
      ul: window.navigator.language,
      an: pkg.name,
      ua: window.navigator.userAgent,
      av: `${process.platform}-${pkg.version}${pkg.earlyBuildId ? '-' + pkg.earlyBuildId : ''}`
    }, args)
    const qs = querystring.stringify(fullArgs)

    const url = 'https://www.google-analytics.com/collect?' + qs
    return window.fetch(url, { method: 'post' })
  }

  /**
  * Log the app was opened
  */
  appOpened () {
    return this.send({ cd2: 'opened' })
  }

  /**
  * Log the app is alive
  */
  appHeartbeat () {
    return this.send({ cd2: 'heartbeat' })
  }

  /**
  * Log the hash changed
  */
  appHashChanged () {
    return this.send({ cd2: 'navigate' })
  }
}

export default new Analytics()
