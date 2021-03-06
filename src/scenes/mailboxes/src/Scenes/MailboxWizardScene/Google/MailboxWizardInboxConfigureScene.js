import PropTypes from 'prop-types'
import React from 'react'
import { RaisedButton, Dialog, RadioButtonGroup, RadioButton } from 'material-ui'
import shallowCompare from 'react-addons-shallow-compare'
import GoogleDefaultService from 'shared/Models/Accounts/Google/GoogleDefaultService'
import { mailboxActions, GoogleDefaultServiceReducer } from 'stores/mailbox'
import { Row, Col } from 'Components/Grid'

const styles = {
  radioButton: {
    marginBottom: 8,
    marginTop: 8
  },
  title: {
    fontWeight: 'normal',
    color: 'rgb(33, 33, 33)'
  },
  modeTitle: {
    fontWeight: 'normal'
  },
  previewImage: {
    display: 'block',
    maxWidth: '100%',
    boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px',
    borderRadius: 2,
    marginLeft: 'auto',
    marginRight: 'auto'
  }
}

export default class MailboxWizardInboxConfigureScene extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        mailboxId: PropTypes.string.isRequired
      })
    })
  }
  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      open: true,
      unreadMode: GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_UNBUNDLED,
      hoveredUnreadMode: GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_UNBUNDLED
    }
  })()

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the user picking a configuration
  */
  handleNext = () => {
    const id = this.props.match.params.mailboxId
    mailboxActions.reduceService(id, GoogleDefaultService.type, GoogleDefaultServiceReducer.setUnreadMode, this.state.unreadMode)

    this.setState({ open: false })
    setTimeout(() => {
      window.location.hash = '/mailbox_wizard/google/services/' + id
    }, 250)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { open, unreadMode, hoveredUnreadMode } = this.state

    const actions = (
      <div>
        <RaisedButton label='Next' primary onClick={this.handleNext} />
      </div>
    )

    return (
      <Dialog
        open={open}
        contentStyle={{ width: '90%', maxWidth: 1200 }}
        actions={actions}
        bodyClassName='ReactComponent-MaterialUI-Dialog-Body-Scrollbars'
        modal
        autoScrollBodyContent>
        <Row>
          <Col xs={6}>
            <h3 style={styles.title}>Pick which unread mode to use</h3>
            <p>
              Google Inbox organizes your emails into bundles. You can configure
              Wavebox to notify you about these or emails when they arrive depending
              on how you use Google Inbox.
            </p>
            <p>
              <small>This setting can be changed later in your account settings</small>
            </p>
            <RadioButtonGroup
              name='unreadMode'
              onChange={(evt, value) => this.setState({ unreadMode: value })}
              defaultSelected={unreadMode}>
              <RadioButton
                style={styles.radioButton}
                value={GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_UNBUNDLED}
                onMouseEnter={() => this.setState({ hoveredUnreadMode: GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_UNBUNDLED })}
                label='Unread Unbundled Messages' />
              <RadioButton
                style={styles.radioButton}
                value={GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD}
                onMouseEnter={() => this.setState({ hoveredUnreadMode: GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD })}
                label='Unread Inbox' />
            </RadioButtonGroup>
            <p>
              <small>Hover over each option for more information</small>
            </p>
          </Col>
          <Col xs={6}>
            {hoveredUnreadMode === GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD_UNBUNDLED ? (
              <div>
                <h3 style={styles.modeTitle}>Categories Inbox</h3>
                <img style={styles.previewImage} src='../../images/ginbox_mode_unreadunbundled_small.png' />
                <p>
                  Some new emails are automatically placed in bundles such as <em>Social</em>
                  and <em>Promotions</em> when they arrive. You'll only be notified about emails
                  that aren't placed in bundles such as these. This is default behaviour also seen
                  in the iOS and Android Inbox Apps.
                </p>
              </div>
            ) : undefined}
            {hoveredUnreadMode === GoogleDefaultService.UNREAD_MODES.INBOX_UNREAD ? (
              <div>
                <h3 style={styles.modeTitle}>Unread Inbox</h3>
                <img style={styles.previewImage} src='../../images/ginbox_mode_inbox_small.png' />
                <p>
                  Some new emails are automatically placed in bundles such as <em>Social</em>
                  and <em>Promotions</em> when they arrive. You'll be notified about the total amount
                  of unread emails in your account, whether they are in a bundle or not.
                </p>
              </div>
            ) : undefined}
          </Col>
        </Row>
      </Dialog>
    )
  }
}
