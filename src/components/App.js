import React, { Component } from 'react';
import Toolbar from './Toolbar'
import Messages from './Messages'
import ComposeMessage from './ComposeMessage'
import '../App.css';


class App extends Component {

  constructor(props) {
      super(props)
      this.state = { messages: [] }
    }


// LOADS THE DATA FROM THE API ENDPOINT (INVOKED IMMEDIATELY AFTER A COMPONENT IS MOUNTED)
  async componentDidMount() {
    const response = await this.request(`/api/messages`)
    const json = await response.json()
    this.setState({messages: json._embedded.messages})
  }
// --------------------------------------------------------------------------------------------------------


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
// THIS WILL PASS IN NEW ARGUMENTS TO THE 'REQUEST' COMPONENT ('PATH', 'METHOD', 'BODY')
// the payload is the part of transmitted data that is the actual intended message
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
      // FIND THE MESSAGE THAT WAS SELECTED, THEN FIND THAT MESSAGES ID
      "messageIds": this.state.messages.filter(message => message.selected).map(message => message.id),
      "command": "delete"
    })
    // SET A VARIABLE TO EQUAL THE LIST OF MESSAGES MINUS THE ONE THAT IS SELECTED
    const messages = this.state.messages.filter(message => !message.selected)
    // UPDATE THE STATE TO SHOW ALL MESSAGES MINUS THE ONE SELECTED
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
    // THIS WILL PASS IN NEW ARGUMENTS TO THE 'REQUEST' COMPONENT ('PATH', 'METHOD', 'BODY')
      const response = await this.request('/api/messages', 'POST', {
        subject: message.subject,
        body: message.body,
      })

      // THIS WILL CONVERT THE NEW MESSAGE TO JSON
      const newMessage = await response.json()

      // THIS WILL SET A VARIABLE TO EQUAL THE CURRENT MESSAGES, AND
      // THE NEW FORMATED MESSAGE THAT WAS COMPOSED IN THE FORM
      const messages = [...this.state.messages, newMessage]

      // THIS WILL UPDATE THE 'STATE' OF MESSAGES TO SHOW THE CURRENT MESSAGES AND
      // THE NEW MESSAGE THAT WAS CREATED. AS WELL AS TOGGLE 'OFF' THE COMPOSE NEW MESSAGE COMPONENT
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
