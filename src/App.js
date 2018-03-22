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
      const threadIndex = state.threads.findIndex(
        (t) => t.id === action.threadId
      )
      const oldThread = state.threads[threadIndex]
      const newThread = {
        ...oldThread,
        messages: oldThread.messages.concat(newMessage)
      }
      return {
        ...state,
        threads: [
          ...state.threads.slice(0, threadIndex),
          newThread,
          ...state.threads.slice(
            threadIndex + 1, state.threads.length
          )
        ]
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


const initialState = { 
  activeThreadId: '1-fca2',
  threads: [
    {
      id: '1-fca2',
      title: 'Nathan Drake',
      messages: [
        {
          text: 'Greatness from small beginnings',
          timestamp: Date.now(),
          id: uuid.v4(),
        },
      ]
    },
    {
      id: '2-be91',
      title: 'Lara Croft',
      messages: [],
    }
  ]
}

const store = createStore(reducer, initialState)

class App extends React.Component {
  componentDidMount(){
    store.subscribe(() => this.forceUpdate())
  }

  render(){
    const state = store.getState()
    const activeThreadId = state.activeThreadId
    const threads = state.threads
    const activeThread = threads.find((t) => t.id === activeThreadId)

    const tabs = threads.map(t => (
      {
        title: t.title,
        active: t.id === activeThreadId,
      }
    ))

    return (
      <div> 
        <ThreadTabs tabs={tabs}/>
        <Thread thread={activeThread}/>
      </div>
    )
  }
}

class ThreadTabs extends React.Component {
  render(){
    const tabs = this.props.tabs.map((tab, index) => (
      <div 
        key={index}
        className="nav-item"
      >
        <a className={tab.active ? "nav-link active" : "nav-link"}>{tab.title}</a>
      </div>
    ))
    return (
      <div className="nav nav-pills">
        {tabs}
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
        <div className="input-group">
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
    )
  }
}

class Thread extends React.Component {
  handleClick = (id) => {
    store.dispatch({
      type: 'DELETE_MESSAGE',
      id: id,
    })
  }
  render(){
    const messages = this.props.thread.messages.map((message, index) => (
        <div
          className="card"
          key={index}
          onClick={() => this.handleClick(message.id)}
        >
            <div className="card-body">
              <h5 className="card-title">{message.text}</h5>
              <h6 className="card-subtitle">@{message.timestamp}</h6>
            </div>
        </div>
    ))
    return (
      <div className="row justify-content-md-center mt-4">
      <div className="col-md-12 text-center">
        <div className="list-group">
          {messages}
        </div>
        <MessageInput/>
      </div>
      </div>
    )
  }
}

export default App






// subscribe in high level component componentDidMount 
// get store state in render
// dispatch actions in lower level components onclick

