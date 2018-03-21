import React from 'react'
import { createStore } from 'redux'
import uuid from 'uuid'

function reducer(state, action){
  switch(action.type){
    case 'ADD_MESSAGE':
      const newMessage = {
        text: action.text,
        timestamp: Date.now(),
        id: uuid.v4(),
      }
      return {
        messages: state.messages.concat(newMessage)
      }
    case 'DELETE_MESSAGE':
      return {
        messages: state.messages.filter((m) => (
          m.id !== action.id
        ))
      }
    default: 
      return state
    }
}


const initialState = { messages: [] }

const store = createStore(reducer, initialState)

class App extends React.Component {
  componentDidMount(){
    store.subscribe(() => this.forceUpdate())
  }

  render(){
    const messages = store.getState().messages

    return (
      <div className="alert alert-light container mt-5">
        <MessageView messages={messages}/>
        <MessageInput />
      </div>
    )
  }
}

class MessageInput extends React.Component {
  state = {
    value: '',
  }

  onChange = (e) => {
    this.setState({
      value: e.target.value,
    })
  }

  handleSubmit = () => {
    store.dispatch({
      type: 'ADD_MESSAGE',
      text: this.state.value
    })
    this.setState({
      value: '',
    })
  }
  render(){
    return (
      <div className="row justify-content-md-center mt-2">
        <div className="input-group col-md-6">
          <input
            className="form-control"
            onChange={this.onChange}
            value={this.state.value}
            type='text'
          />
          <button
            className="btn btn-primary"
            onClick={this.handleSubmit}
            type='submit'
          >
            Submit
          </button>
        </div>
      </div>
    )
  }
}

class MessageView extends React.Component {
  handleClick = (id) => {
    store.dispatch({
      type: 'DELETE_MESSAGE',
      id: id,
    })
  }
  render(){
    const messages = this.props.messages.map((message, index) => (
      <div className="row justify-content-md-center">
        <div
          className="card col-md-6"
          key={index}
          onClick={() => this.handleClick(message.id)}
        >
        
            <div className="card-body">
              <h5 className="card-title">{message.text}</h5>
              <h6 className="card-subtitle">@{message.timestamp}</h6>
            </div>
        </div>
      </div>
    ))
    return (
      <div className="list-group">
        {messages}
      </div>
    )
  }
}

export default App






// subscribe in high level component componentDidMount 
// get store state in render
// dispatch actions in lower level components onclick

