import React from 'react';

import {MDCSnackbar} from '@material/snackbar';

import debounce from 'lodash.debounce';

import PubSub from 'pubsub-js';

class Snackbar extends React.Component {
  constructor(props) {
    super(props)

    console.log('Snackbar', this, arguments)
  }

  el = React.createRef()

  state = {
    message: null
  }

  componentDidMount() {
    console.log('el', this.el)
    this.mdc = new MDCSnackbar(this.el.current);
    this.mdc.show = debounce(this.mdc.show, 500);

    console.log('Snackbar.componentDidMount', this, arguments)

    PubSub.subscribe('flashmessage', function (msg, data) {
      console.log('flashmessage', data)
      this.setState({message: data})
      
      const {message} = this.state
      message && this.mdc.show({message})
    }.bind(this));
  }

  componentWillUnmount() {
    PubSub.unsubscribe('flashmessage');
  }

  render() {
    return (
      <div className="mdc-snackbar"
           aria-live="assertive"
           aria-atomic="true"
           aria-hidden="true" ref={this.el}>
        <div className="mdc-snackbar__text">{this.state.message}</div>
        <div className="mdc-snackbar__action-wrapper">
          <button type="button" className="mdc-snackbar__action-button">tata</button>
        </div>
      </div>
    )
  }
}

export default Snackbar;