import React from 'react';
import {BrowserRouter as Router, Route, Link} from 'react-router-dom';

// see: https://www.javascriptstuff.com/component-communication/#6-observer-pattern
import PubSub from 'pubsub-js';

import api from './lib/api.js';

import Snackbar from './Snackbar';

import {MDCTextField} from '@material/textfield';

import './App.scss';

//  █████╗ ██╗   ██╗████████╗██╗  ██╗
// ██╔══██╗██║   ██║╚══██╔══╝██║  ██║
// ███████║██║   ██║   ██║   ███████║
// ██╔══██║██║   ██║   ██║   ██╔══██║
// ██║  ██║╚██████╔╝   ██║   ██║  ██║
// ╚═╝  ╚═╝ ╚═════╝    ╚═╝   ╚═╝  ╚═╝

class Auth extends React.Component {

  formRef = React.createRef();
  mdcTextFieldUsername = React.createRef();
  mdcTextFieldPassword = React.createRef();

  onSubmit(e) {
    e.preventDefault()

    const {username, password} = this.formRef;

    //
    // 1. try to register
    //

    api(this.props.signupEndpoint, {
      method: 'POST',
      body: {
        username: username.value,
        password: password.value
      }
    }).then(function (data) {
      PubSub.publish('user:registered', data);
    }).catch(function (er) {
      console.error('er', er)

      //
      // 2. username already taken ? => try to login
      //

      if (er.message === 'The username already exists') {
        api(this.props.loginEndpoint, {
          method: 'POST',
          body: {
            username: username.value,
            password: password.value
          }
        }).then(function (data) {
          PubSub.publish('user:loggedin', data);
        }).catch(function (er) {
          console.error('er', er)
          PubSub.publish('flashmessage', er.message);
        });
      } else {
        PubSub.publish('flashmessage', er.message);
      }
    }.bind(this));
  }

  componentDidMount() {
    new MDCTextField(this.mdcTextFieldUsername.current);
    new MDCTextField(this.mdcTextFieldPassword.current);
  }

  render() {
    return (
      <>
        <div className="Auth">
          <form onSubmit={this.onSubmit.bind(this)} ref={el => this.formRef = el}>

            {/* Username field */}
            <div className="mdc-text-field mdc-text-field--outlined mdc-text-field--dense" ref={this.mdcTextFieldUsername}>
              <input id="auth-username" className="mdc-text-field__input" type="text" name="username" required />
              <div className="mdc-notched-outline">
                <div className="mdc-notched-outline__leading"></div>
                <div className="mdc-notched-outline__notch">
                  <label htmlFor="auth-username" className="mdc-floating-label">Username</label>
                </div>
                <div className="mdc-notched-outline__trailing"></div>
              </div>
            </div>

            {/* Password field */}
            <div className="mdc-text-field mdc-text-field--outlined mdc-text-field--dense" ref={this.mdcTextFieldPassword}>
              <input id="auth-password" className="mdc-text-field__input" type="password" name="password" required pattern=".{7,}" />
              <div className="mdc-notched-outline">
                <div className="mdc-notched-outline__leading"></div>
                <div className="mdc-notched-outline__notch">
                  <label htmlFor="auth-password" className="mdc-floating-label">P4ssw0rd</label>
                </div>
                <div className="mdc-notched-outline__trailing"></div>
              </div>
            </div>

            <button className="mdc-button mdc-button--raised" type="submit">Register / login</button>
          </form>
        </div>
      </>
    );
  }
}

// ██╗      ██████╗  ██████╗  ██████╗ ██╗   ██╗████████╗
// ██║     ██╔═══██╗██╔════╝ ██╔═══██╗██║   ██║╚══██╔══╝
// ██║     ██║   ██║██║  ███╗██║   ██║██║   ██║   ██║   
// ██║     ██║   ██║██║   ██║██║   ██║██║   ██║   ██║   
// ███████╗╚██████╔╝╚██████╔╝╚██████╔╝╚██████╔╝   ██║   
// ╚══════╝ ╚═════╝  ╚═════╝  ╚═════╝  ╚═════╝    ╚═╝   

class Logout extends React.Component {
  onSubmit(e) {
    e.preventDefault()

    api(this.props.endpoint, {
      method: 'POST'
    }).then(function (data) {
      PubSub.publish('user:loggedout', data);
    });
  }

  render() {
    const {endpoint} = this.props

    return (
      <form action={endpoint} method="POST" onSubmit={this.onSubmit.bind(this)}>
        <button className="material-icons mdc-top-app-bar__action-item" type="submit">eject</button>
      </form>
    );
  }
}

//  ██████╗██████╗ ███████╗ █████╗ ████████╗███████╗     ████████╗ █████╗ ███████╗██╗  ██╗
// ██╔════╝██╔══██╗██╔════╝██╔══██╗╚══██╔══╝██╔════╝     ╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝
// ██║     ██████╔╝█████╗  ███████║   ██║   █████╗          ██║   ███████║███████╗█████╔╝ 
// ██║     ██╔══██╗██╔══╝  ██╔══██║   ██║   ██╔══╝          ██║   ██╔══██║╚════██║██╔═██╗ 
// ╚██████╗██║  ██║███████╗██║  ██║   ██║   ███████╗███████╗██║   ██║  ██║███████║██║  ██╗
//  ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚══════╝╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝

class CreateTask extends React.Component {

  formRef = React.createRef();

  onSubmit(e) {
    e.preventDefault()

    const {title} = this.formRef;

    api(this.props.endpoint, {
      method: 'POST',
      body: {
        title: title.value
      }
    }).then(function (data) {
      this.formRef.reset();

      PubSub.publish('tasks:created', data);
    }.bind(this)).catch(function (er) {
      console.error('er', er)
      PubSub.publish('flashmessage', er.message);
    });
  }

  render() {
    const {endpoint} = this.props

    return (
      <>
        <div className="createTask">
          <form action={endpoint} method="POST" onSubmit={this.onSubmit.bind(this)} ref={el => this.formRef = el}>

            <ul className="mdc-list" role="group" aria-label="List with checkbox items">
              <li className="mdc-list-item" role="checkbox" aria-checked="false">
                <span className="mdc-list-item__graphic"></span>
                <div className="mdc-list-item__text">

                  {/* title field */}
                  <div className="mdc-text-field mdc-text-field--fullwidth" ref={this.mdcTextFieldTitle}>
                    <input className="mdc-text-field__input" type="text" name="title" placeholder="Add a new task" />
                  </div>

                </div>
                <div className="mdc-list-item__meta">
                  <button className="mdc-icon-button material-icons">add</button>
                </div>
              </li>
            </ul>
          </form>
        </div>
      </>
    )
  }
}

// ██╗     ██╗███████╗████████╗  ████████╗ █████╗ ███████╗██╗  ██╗
// ██║     ██║██╔════╝╚══██╔══╝  ╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝
// ██║     ██║███████╗   ██║        ██║   ███████║███████╗█████╔╝ 
// ██║     ██║╚════██║   ██║        ██║   ██╔══██║╚════██║██╔═██╗ 
// ███████╗██║███████║   ██║███████╗██║   ██║  ██║███████║██║  ██╗
// ╚══════╝╚═╝╚══════╝   ╚═╝╚══════╝╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝

class ListTasks extends React.Component {

  //
  // 🗑️
  //

  handleRemove(taskid) {
    api(`${App.settings.api}/tasks/delete/${taskid}`, {
      method: 'POST'
    }).then(function (data) {
      PubSub.publish('task:remove', taskid);
    }).catch(function (er) {
      console.error('er', er)
      PubSub.publish('flashmessage', er.message);
    });
  }

  //
  // ✅
  //

  handleToggle(task) {
    api(`${App.settings.api}/tasks/edit/${task._id}`, {
      method: 'POST',
      body: {
        doneyet: !(!!task.doneyet)
      }
    }).then(function (data) {
      PubSub.publish('task:updated', data);
    }).catch(function (er) {
      console.error('er', er)
      PubSub.publish('flashmessage', er.message);
    });
  }

  render() {
    const {tasks, owner} = this.props;

    return (
      <>
        <div className="listTasks">
          {/* https://material.io/develop/web/components/lists/ */}
          <ul className="mdc-list" role="group" aria-label="List with checkbox items">
            {tasks.map((task) => {
              const title = task.title || 'Untitled';

              return (
                <li key={task._id} className="mdc-list-item" role="checkbox" aria-checked="false">
                  
                  <span className="mdc-list-item__graphic">
                    {/* https://material.io/develop/web/components/input-controls/checkboxes/ */}
                    <div className="mdc-checkbox">
                      <input type="checkbox" className="mdc-checkbox__native-control"
                        id={`demo-list-checkbox-item-${task._id}`}
                        checked={task.doneyet} disabled={owner !== task.owner}
                        onClick={() => this.handleToggle(task)}
                        readOnly />
                      <div className="mdc-checkbox__background">
                        <svg className="mdc-checkbox__checkmark" viewBox="0 0 24 24">
                          <path className="mdc-checkbox__checkmark-path" fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59"/>
                        </svg>
                        <div className="mdc-checkbox__mixedmark"></div>
                      </div>
                    </div>
                  </span>
                  
                  <label className={`mdc-list-item__text ${task.doneyet ? 'done' : ''}`} htmlFor={`demo-list-checkbox-item-${task._id}`} style={{pointerEvents: 'auto'}}>
                    {title}
                  </label>

                  <div className="mdc-list-item__meta">
                    <i className="mdc-icon-button material-icons" onClick={() => this.handleRemove(task._id)} disabled={owner !== task.owner}>delete</i>
                    <i className="mdc-icon-button material-icons" disabled={owner !== task.owner}>
                      <Link to={`/tasks/${task._id}`}>edit</Link>
                    </i>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </>
    )
  }
}

// ███████╗██████╗ ██╗████████╗  ████████╗ █████╗ ███████╗██╗  ██╗
// ██╔════╝██╔══██╗██║╚══██╔══╝  ╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝
// █████╗  ██║  ██║██║   ██║        ██║   ███████║███████╗█████╔╝ 
// ██╔══╝  ██║  ██║██║   ██║        ██║   ██╔══██║╚════██║██╔═██╗ 
// ███████╗██████╔╝██║   ██║███████╗██║   ██║  ██║███████║██║  ██╗
// ╚══════╝╚═════╝ ╚═╝   ╚═╝╚══════╝╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝

class EditTask extends React.Component {

  formRef = React.createRef();
  mdcTextFieldTitle = React.createRef();
  mdcTextFieldDescription = React.createRef();

  onSubmit(e) {
    e.preventDefault();

    const {title, description} = this.formRef;

    api(this.props.endpoint, {
      method: 'POST',
      body: {
        title: title.value,
        description: description.value
      }
    }).then(function (data) {
      PubSub.publish('task:updated', data);
    }).catch(function (er) {
      console.error('er', er)
      PubSub.publish('flashmessage', er.message);
    });
  }

  componentDidMount() {
    new MDCTextField(this.mdcTextFieldTitle.current);
    new MDCTextField(this.mdcTextFieldDescription.current);
  }

  render() {
    const {task, endpoint} = this.props

    return (
      <>
        <div className="editTask">
          <form action={endpoint} method="POST" onSubmit={this.onSubmit.bind(this)} ref={el => this.formRef = el}>

            <div className="mdc-text-field mdc-text-field--fullwidth" ref={this.mdcTextFieldTitle}>
              <input className="mdc-text-field__input" type="text" name="title" defaultValue={task && task.title} placeholder="Title" />
            </div>

            <div className="mdc-text-field text-field mdc-text-field--fullwidth mdc-text-field--textarea" ref={this.mdcTextFieldDescription}>
              <textarea id="editTask-description" name="description" defaultValue={task && task.description} className="mdc-text-field__input"></textarea>
              <div className="mdc-notched-outline mdc-notched-outline--upgraded">
                <div className="mdc-notched-outline__leading"></div>
                <div className="mdc-notched-outline__notch">
                  <label className="mdc-floating-label" htmlFor="editTask-description">Description</label>
                </div>
                <div className="mdc-notched-outline__trailing"></div>
              </div>
            </div>

            <button className="mdc-button mdc-button--raised">Save</button> <Link to="/" className="mdc-button">back</Link>
          </form>
        </div>
      </>
    )
  }
}

//  █████╗ ██████╗ ██████╗ 
// ██╔══██╗██╔══██╗██╔══██╗
// ███████║██████╔╝██████╔╝
// ██╔══██║██╔═══╝ ██╔═══╝ 
// ██║  ██║██║     ██║     
// ╚═╝  ╚═╝╚═╝     ╚═╝     

class App extends React.Component {

  state = {
    user: null,
    tasks: [],
    flashmessage: null
  }

  //
  // 👤
  //

  isLoggedIn() {
    api(`${App.settings.api}/loggedin`, {
      method: 'GET'
    }).then(function (data) {
      PubSub.publish('user:loggedin', data);
    }).catch(function (er) {
      this.setState({user: null})
    }.bind(this));
  }

  //
  // ⬇️
  //

  getTasks() {
    api(`${App.settings.api}/tasks`, {
      method: 'GET'
    }).then(function (data) {
      this.setState({tasks: data})
    }.bind(this));
  }

  componentDidMount() {

    // Check if already logged
    this.isLoggedIn();
    
    // Get tasks list
    this.getTasks();

    //
    // user related topics
    //

    PubSub.subscribe('user:registered', (msg, data) => {
      //console.log('user:registered', data)
      this.setState({user: data});
      PubSub.publish('flashmessage', 'Welcome, you are now registered.');
    });
    PubSub.subscribe('user:loggedin', (msg, data) => {
      //console.log('user:loggedin', data)
      this.setState({user: data});
      PubSub.publish('flashmessage', 'You are now logged-in.');
    });
    PubSub.subscribe('user:loggedout', (msg, data) => {
      //console.log('user:loggedout', data)
      this.setState({user: null});
      PubSub.publish('flashmessage', 'You are now logged-out.');
    });

    //
    // tasks related topics
    //

    PubSub.subscribe('tasks:created', (msg, data) => {
      //console.log('tasks:created', data)
      const newTasks = this.state.tasks.reverse().concat([data]).reverse(); // prepend
      this.setState({tasks: newTasks});
    });
    PubSub.subscribe('task:remove', (msg, taskid) => {
      //console.log('task:remove', taskid)
      let newTasks = this.state.tasks.slice();
      let index = newTasks.findIndex((el) => el._id === taskid)
      if (index !== -1) {
        newTasks.splice(index, 1);
        this.setState({tasks: newTasks});
      }
    });
    PubSub.subscribe('task:updated', (msg, task) => {
      //console.log('task:updated', task)
      let newTasks = this.state.tasks.slice();
      let index = newTasks.findIndex((el) => el._id === task._id)
      if (index !== -1) {
        newTasks[index] = task;
        this.setState({tasks: newTasks});
        PubSub.publish('flashmessage', 'Task saved.');
      }
    });
    
  }

  componentWillUnmount() {
    PubSub.unsubscribe('user:registered');
    PubSub.unsubscribe('user:loggedin');
    PubSub.unsubscribe('user:loggedout');

    PubSub.unsubscribe('tasks:created');
    PubSub.unsubscribe('task:remove');
    PubSub.unsubscribe('task:updated');
  }

  render() {
    const {user} = this.state;
    const {tasks} = this.state;

    return (
      <Router>
        <div className="App">

          <header className="mdc-top-app-bar mdc-top-app-bar--short" style={{position: 'static'}}>
            <div className="mdc-top-app-bar__row">
              <section className="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">
                {/*<a href="#" className="material-icons mdc-top-app-bar__navigation-icon">menu</a>*/}
                <span className="mdc-top-app-bar__title"><Link to="/">IronTODO</Link></span>
              </section>
              <section className="mdc-top-app-bar__section mdc-top-app-bar__section--align-end" role="toolbar">
                {user && (
                  <Logout endpoint={`${App.settings.api}/logout`} />
                )}
                
              </section>
            </div>

            {!user && (
              <Auth signupEndpoint={`${App.settings.api}/signup`} loginEndpoint={`${App.settings.api}/login`} />
            )}
          </header>

          <Route path="/" exact={true} render={() => (
            <>
              <CreateTask endpoint={`${App.settings.api}/tasks/create`} />

              <ListTasks endpoint={`${App.settings.api}/tasks`} tasks={this.state.tasks} owner={user && user._id} />
            </>
          )}/>

          <Route path="/tasks/:taskid" render={({match}) => {
            const {taskid} = match.params;
            const task = tasks.find(t => t._id === taskid);

            return (
              <>
                <EditTask endpoint={`${App.settings.api}/tasks/edit/${taskid}`} task={task} />
              </>
            )
          }} />

          <Route path="/id" exact={true} render={() => (
            <>
              id
            </>
          )}/>

          <Snackbar />

        </div>
      </Router>
    );
  }
}

App.settings = {
  api: 'http://localhost:5000/api'
}

export default App;
