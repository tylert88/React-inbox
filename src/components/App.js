import React, { Component } from 'react';
import Toolbar from './Toolbar'
import Messages from './Messages'
import ComposeMessage from './ComposeMessage'
import '../App.css';
// state = {
//   messages: []
// }
//
// async componentDidMount() {
//   const messages = await this.getMessages()
//   const messagesById = messages.reduce((result, message) => {
//     result[message.id] = message
//     return result
//   }, {})
//
//   this.setState({
//      messages: messages.map(message => ({ ...message })),
//   })
// }
//
// // FETCH ALL MESSAGES
// async getMessages() {
//   const response = await fetch('http://localhost:8082/api/messages')
//   const json = await response.json()
//   return json._embedded.messages
// }

class App extends Component {

  constructor(props) {
      super(props)
      this.state = { messages: [] }
    }

    async componentDidMount() {
      const response = await this.request(`/api/messages`)
      const json = await response.json()
      this.setState({messages: json._embedded.messages})
    }


// MASTER UTILITY TO TOGGLE CLICK EVENTS
  toggleProperty(message, property) {
    const index = this.state.messages.indexOf(message)
    this.setState({
      messages: [
        ...this.state.messages.slice(0, index),
        { ...message, [property]: !message[property] },
        ...this.state.messages.slice(index + 1),
      ]
    })
  }

  async toggleSelect(message) {
    this.toggleProperty(message, 'selected')
  }
// --------------------------------------------------------------------------------------------------------


// CALL THE API
  async request(path, method = 'GET', body = null) {
   if (body) body = JSON.stringify(body)
   return await fetch(`${process.env.REACT_APP_API_URL}${path}`, {
     method: method,
     headers: {
       'Content-Type': 'application/json',
       'Accept': 'application/json',
     },
     body: body
   })
 }
// --------------------------------------------------------------------------------------------------------


// SHOW THE MOST UPDATED DATA FOR MESSAGES
 async updateMessages(payload) {
   await this.request('/api/messages', 'PATCH', payload)
 }
// --------------------------------------------------------------------------------------------------------


// TOGGLE THE STAR ICON
 async toggleStar(message) {
   await this.updateMessages({
     "messageIds": [ message.id ],
     "command": "star",
     "star": message.starred
   })

   this.toggleProperty(message, 'starred')
 }
 // --------------------------------------------------------------------------------------------------------


// MARK MESSAGE AS READ
 async markAsRead() {
   await this.updateMessages({
     "messageIds": this.state.messages.filter(message => message.selected).map(message => message.id),
     "command": "read",
     "read": true
   })

   this.setState({
      messages: this.state.messages.map(message => (
        message.selected ? { ...message, read: true } : message
      ))
    })
  }
// --------------------------------------------------------------------------------------------------------


// MARK MESSAGE AS UNREAD
  async markAsUnread() {
    await this.updateMessages({
      "messageIds": this.state.messages.filter(message => message.selected).map(message => message.id),
      "command": "read",
      "read": false
    })

    this.setState({
      messages: this.state.messages.map(message => (
        message.selected ? { ...message, read: false } : message
      ))
    })
  }
// --------------------------------------------------------------------------------------------------------


// DELETE MESSAGES
  async deleteMessages() {
    await this.updateMessages({
      "messageIds": this.state.messages.filter(message => message.selected).map(message => message.id),
      "command": "delete"
    })

    const messages = this.state.messages.filter(message => !message.selected)
    this.setState({ messages })
  }
// --------------------------------------------------------------------------------------------------------


// TOGGLE TO SELECT ALL INBOX MESSAGES
  toggleSelectAll() {
    const selectedMessages = this.state.messages.filter(message => message.selected)
    const selected = selectedMessages.length !== this.state.messages.length
    this.setState({
      messages: this.state.messages.map(message => (
        message.selected !== selected ? { ...message, selected } : message
      ))
    })
  }
// --------------------------------------------------------------------------------------------------------


// TOGGLE THE COMPOSE NEW MESSAGE FORM
  toggleCompose() {
    this.setState({composing: !this.state.composing})
  }
// --------------------------------------------------------------------------------------------------------


// APPLY A NEW LABLE
  async applyLabel(label) {
      await this.updateMessages({
        "messageIds": this.state.messages.filter(message => message.selected).map(message => message.id),
        "command": "addLabel",
        "label": label
      })

      const messages = this.state.messages.map(message => (
        message.selected && !message.labels.includes(label) ?
          { ...message, labels: [...message.labels, label].sort() } :
          message
      ))
      this.setState({ messages })
  }
// --------------------------------------------------------------------------------------------------------


// REMOVE A CURRENT LABLE
  async removeLabel(label) {
    await this.updateMessages({
      "messageIds": this.state.messages.filter(message => message.selected).map(message => message.id),
      "command": "removeLabel",
      "label": label
    })

    const messages = this.state.messages.map(message => {
      const index = message.labels.indexOf(label)
      if (message.selected && index > -1) {
        return {
          ...message,
          labels: [
            ...message.labels.slice(0, index),
            ...message.labels.slice(index + 1)
          ]
        }
      }
      return message
    })
    this.setState({ messages })
  }
// --------------------------------------------------------------------------------------------------------


// SEND A NEW MESSAGE
  async sendMessage(message) {
      const response = await this.request('/api/messages', 'POST', {
        subject: message.subject,
        body: message.body,
      })
      const newMessage = await response.json()

      const messages = [...this.state.messages, newMessage]
      this.setState({
        messages,
        composing: false,
      })
    }
// --------------------------------------------------------------------------------------------------------

  render() {
    return (
      <div>
        <div className="navbar navbar-default" role="navigation">
          <div className="container">
            <div className="navbar-header">
              <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target=".navbar-collapse">
                <span className="sr-only">Toggle navigation</span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
              </button>
              <a className="navbar-brand" href="/">React Inbox</a>
            </div>
          </div>
        </div>

        <div className="container">
          <Toolbar
            messages={this.state.messages}
            markAsRead={this.markAsRead.bind(this)}
            markAsUnread={this.markAsUnread.bind(this)}
            deleteMessages={this.deleteMessages.bind(this)}
            toggleSelectAll={this.toggleSelectAll.bind(this)}
            toggleCompose={this.toggleCompose.bind(this)}
            applyLabel={this.applyLabel.bind(this)}
            removeLabel={this.removeLabel.bind(this)}
            />

            {this.state.composing ? <ComposeMessage sendMessage={ this.sendMessage.bind(this) } /> : null}

          <Messages
            messages={this.state.messages}
            toggleSelect={this.toggleSelect.bind(this)}
            toggleStar={this.toggleStar.bind(this)}
            />
        </div>
      </div>
    );
  }
}

export default App;
