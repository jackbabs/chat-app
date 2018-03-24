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

const App = () => (
  <div> 
    <ThreadTabs/>
    <ThreadDisplay/>
  </div>
)

const Tabs = (props) => (
  <div className="nav nav-pills">
    {
      props.tabs.map((tab, index) => (
        <div
          key={index}
          className="nav-item"
          onClick={() => props.onClick(tab.id)}
        >
          <a 
          className={tab.active ? "nav-link active" : "nav-link"}
          style={{cursor: 'pointer'}}
          >
            {tab.title}
          </a>
        </div>
      ))
    }
  </div>
)

class ThreadTabs extends React.Component {
  componentDidMount(){
    store.subscribe(() => this.forceUpdate())
  }
  render(){
    const state = store.getState()
    const tabs = state.threads.map(t => (
      {
        title: t.title,
        active: t.id === state.activeThreadId,
        id: t.id,
      }
    ))
    return (
      <Tabs
        tabs={tabs}
        onClick={(id) => (
          store.dispatch({
            type: 'OPEN_THREAD',
            id: id,
          })
        )}
      />
    )
  }
}

class TextFieldSubmit extends React.Component {
  state = {
    value: '',
  }

  onChange = (e) => {
    this.setState({
      value: e.target.value,
    })
  }

  handleSubmit = () => {
    this.props.onSubmit(this.state.value)
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

const MessageList = (props) => (
  <div>
  {
    props.messages.map((m, index) => (
      <div
        className="card"
        key={index}
        onClick={() => props.onClick(m.id)}
      >
        <div className="card-body">
          <h5 className="card-title">{m.text}</h5>
          <h6 className="card-subtitle">@{m.timestamp}</h6>
        </div>
      </div>
    ))
  }
  </div>
)

const Thread = (props) => (
  <div className="row justify-content-md-center mt-4">
      <div className="col-md-12 text-center">
        <div className="list-group">
          <MessageList
            messages={props.thread.messages}
            onClick={props.onMessageClick}
          />
          <TextFieldSubmit
            onSubmit={props.onMessageSubmit}
          />
        </div>
    </div>
  </div>
)

class ThreadDisplay extends React.Component {
  componentDidMount(){
    store.subscribe(() => this.forceUpdate())
  }
  render(){
    const state = store.getState()
    const activeThreadId = state.activeThreadId
    const activeThread = state.threads.find(
      t => t.id === activeThreadId
    )
    return (
      <Thread
        thread={activeThread}
        onMessageClick={(id) => (
          store.dispatch({
            type: 'DELETE_MESSAGE',
            id: id,
          })
        )}
        onMessageSubmit={(text) => (
          store.dispatch({
            type: 'ADD_MESSAGE',
            text: text, 
            threadId: activeThreadId,
          })
        )}
      />
    )
  }
}

export default App






// subscribe in high level component componentDidMount 
// get store state in render
// dispatch actions in lower level components onclick

