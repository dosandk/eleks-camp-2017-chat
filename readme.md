# ELEKS front-camp 2017

This is prototype of server for education purpose.  
Allows you to login and chatting with your colleagues.

* [Demo](http://front-camp-chat-client.herokuapp.com/) 
* [Sources](https://github.com/dosandk/eleks-camp-2017-chat-client)

## Login/Sign up
Please use next endpoint for authorization or creating new user.  
If you send credentials for already created user you will be authorized.  
If you send credentials for none existed user, user will be created  
and you will be authorized.

[POST] http://front-camp-chat.herokuapp.com/login
```
{
    "username": "your_username",
    "pass": "your_pass"
}
```

## Sending messages

For sending and receiving messages across sockets  
is used [Socket.io](https://github.com/socketio/socket.io)

Now server support next types of messages:
* `message` - fires when user sent message
* `join` - fires when user connected 
* `disconnect`

<b>Example</b>:
```javascript
    const socket = io.connect(`${DOMAIN_URL}`);
    
    socket.on('message', msg => {
      printMessage(msg);
    });
    
    socket.on('join', msg => {
      printMessage(msg);
    });
    
    socket.on('leave', msg => {
      printMessage(msg);
    });
```
<style>
    html {
        font-size: 16px;
    }
    p { 
       text-indent: 30px;
    }
    pre {
        width: 600px;
        background: #f6f8fa;
    }
</style>
