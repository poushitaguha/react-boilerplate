import React, {Component} from 'react';
import ChatBar from './ChatBar.jsx';
import MessageList from './MessageList.jsx';

const ws = new WebSocket("ws://localhost:3001");   

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: {name: "Anonymous"}, // optional. if currentUser is not defined, it means the user is Anonymous
      messages: [],  // messages coming from the server will be stored here as they arrive
      clientCount : null,
      color: null
    }
  }

  componentDidMount() { 
    console.log("componentDidMount <App />");

    ws.onopen = (event) => {
      console.log("Connected to server");
    };

    ws.onmessage = (event) => {
      console.log(event.data);
      // The socket event data is encoded as a JSON string.
      // This line turns it into an object    
      const message = JSON.parse(event.data);

      let oldMessages = "";
      const incomingMessages = {};
      let newMessages = [];

      if (Number.isInteger(message)) {
        this.setState({ clientCount : message });
      }      

      switch(message.type) {
        case "incomingMessage":
        // handle incoming message
          oldMessages = this.state.messages;
          incomingMessages.type = message.type;
          incomingMessages.id = message.id;
          incomingMessages.username = message.username;
          incomingMessages.content = message.content;
          incomingMessages.color = message.color;
          newMessages = [...oldMessages, incomingMessages];
          this.setState({ messages: newMessages });
          break;
        case "incomingNotification":
        // handle incoming notification
          oldMessages = this.state.messages;
          incomingMessages.type = message.type;
          incomingMessages.id = message.id;
          incomingMessages.content = message.content;          
          newMessages = [...oldMessages, incomingMessages];
          this.setState({ messages: newMessages });
          break;
        default:
          // show an error in the console if the message type is unknown
          throw new Error("Unknown event type " + message.type);
      }
    }

  }

  // Method to add messages and send it to WebSocket Server
  addNewMessage = (currentUser, newMessageInput) => {
    let changedUser = currentUser;
    if (!currentUser) {
      changedUser = "Anonymous";
    }
    const newMessageObject = {
      type: "postMessage",
      username : changedUser,
      content : newMessageInput,
      color: this.state.color
    };
    const msg = JSON.stringify(newMessageObject);
    ws.send(msg);
  }

  // Method to send notification to WebSocket Server when a user changes their name
  changeUser = (newUser) => {
    let changedUser = newUser;
    if (!newUser) {
      changedUser = "Anonymous";
    }

    let currentUser = this.state.currentUser.name
    if(!this.state.currentUser.name) {
      currentUser = "Anonymous";
    }

    const newMessageObject = {
      type: "postNotification",
      username: newUser,
      content: `${currentUser} has changed their name to ${changedUser}`,
    };

    this.setState({currentUser: {name: newUser}}, () => {
      if (newUser !== currentUser) {
        const msg = JSON.stringify(newMessageObject);
        ws.send(msg);        
      }
    })
  }

  render() {
    return (
      <div>
        <nav className="navbar">
          <a href="/" className="navbar-brand">CHATTERBOX</a>
          <p className="users-online">{this.state.clientCount} user(s) online</p>
        </nav>
        <MessageList messages = {this.state.messages} />
        <ChatBar addNewMessage={this.addNewMessage} changeUser={this.changeUser} /> 
      </div>    
    );
  }
}
export default App;