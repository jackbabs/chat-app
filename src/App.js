import React from 'react'
import { createStore, combineReducers } from 'redux'
import uuid from 'uuid'

const reducer = combineReducers({
  activeThreadId: activeThreadIdReducer,
  threads: threadsReducer,
})


function activeThreadIdReducer(state = '1-fca2', action){
  if(action.type === 'OPEN_THREAD'){
    return action.id
  } else {
    return state
  }
}

function findThreadIndex(threads, action){
  switch(action.type){
    case 'ADD_MESSAGE': {
      return threads.findIndex(
        (t) => t.id == action.threadId
      )
    }
    case 'DELETE_MESSAGE': {
      return threads.findIndex(
        (t) => t.messages.find((m) => (
          m.id === action.id
        ))
      )
    }
  }
}

function threadsReducer(state = [
  {
    id: '1-fca2',
    title: 'Nathan Drake',
    messages: messagesReducer(undefined, {})
  },
  {
    id: '2-be91',
    title: 'Lara Croft',
    messages: messagesReducer(undefined, {})
  },
], action){
  switch (action.type){
    case 'ADD_MESSAGE':
    case 'DELETE_MESSAGE': {
      const threadIndex = findThreadIndex(state, action)

      const oldThread = state[threadIndex]

      const newThread = {
        ...oldThread,
        messages: messagesReducer(oldThread.messages, action)
      }
      return [
        ...state.slice(0, threadIndex),
        newThread,
        ...state.slice(
          threadIndex + 1, state.length
        )
      ]
    }
    default: { 
      return state
    }
  }
}

//Creates new message 
//Returns new array of messages that includes new message appended to the end of it 
function messagesReducer(state = [], action){
  switch(action.type){
    case 'ADD_MESSAGE': {
      const newMessage = {
        text: action.text,
        timestamp: Date.now(),
        id: uuid.v4()
      }
      return state.concat(newMessage)
    }
    case 'DELETE_MESSAGE': {
      return state.filter(m => m.id !== action.id)
    }
    default: { 
      return state
    }
  }
}

const store = createStore(reducer)

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
        id: t.id,
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
  handleClick = (id) => {
    store.dispatch({
      type: 'OPEN_THREAD',
      id: id,
    })
  }
  render(){
    const tabs = this.props.tabs.map((tab, index) => (
      <div 
        key={index}
        className="nav-item"
        onClick={() => this.handleClick(tab.id)}
      >
        <a 
          className={tab.active ? "nav-link active" : "nav-link"}
          style={{cursor: 'pointer'}}
          >{tab.title}</a>
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
      text: this.state.value,
      threadId: this.props.threadId,
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
        <MessageInput threadId={this.props.thread.id}/>
      </div>
      </div>
    )
  }
}

export default App






// subscribe in high level component componentDidMount 
// get store state in render
// dispatch actions in lower level components onclick

