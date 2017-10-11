import React from 'react'


const Message = ({
  message,
  toggleSelect,
  toggleStar,
}) => {
  const readClass = message.read ? 'read' : 'unread'
  const selectedClass = message.selected ? 'selected' : ""
  const starClass = message.starred ? 'fa-star' : 'fa-star-o'

  const labels = message.labels.map((label, i) => (
    <span key={i} className="label label-warning">{label}</span>
  ))

  const starMessage = (e) => {
    e.stopPropagation()
    toggleStar(message)
  }

  return (
    <div className={`row message ${readClass} ${selectedClass}`} onClick={() => toggleSelect(message)}>
      <div className="col-xs-1">
        <div className="row">
          <div className="col-xs-2">
            <input
              type="checkbox"
              checked={ !!message.selected }
              readOnly={ true }
              />
          </div>
          <div className="star-container col-xs-2" onClick={ starMessage }>
            <i className={`star fa ${starClass}`}></i>
          </div>
        </div>
      </div>
      <div className="col-xs-11">
        {labels}
        {message.subject}
      </div>
    </div>
  )
}

export default Message
