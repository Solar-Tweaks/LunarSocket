# LunarSocket

Lunar Socket is a Websocket server for Lunar Client.
It allows you to proxy the connection between Lunar Client and Lunar Servers. (To give you cosmetics or emotes for example)

Lunar Client <-> Lunar Socket <-> Lunar Servers

It can intercepts and edit the data in the packets.

# Protocol

You can see Lunar Client protocol detailed [here](https://github.com/Solar-Tweaks/LunarSocket/blob/main/doc/protocol.md)

# Installation

```bash
$ git clone https://github.com/Solar-Tweaks/LunarSocket # Clone repo
$ cd LunarSocket # Go to LunarSocket folder
$ npm install # Install dependencies
$ npm run build # Build the project
```

# Configuration

Open the `config.example.json` file and edit the values
```jsonc
{
  "port": 80, // Port of the server
  "secure": false, // Whether or not to enable SSL (wss protocol)
  "certificates": {
    // Certificates path (only if secure is true)
    "key": "/path/to/key.key",
    "cert": "/path/to/cert.crt"
  },
  "welcomeMessage": "Welcome!", // Message sent to the player when they connects
  "enableWhitelist": true, // Whether or not the enable whitelist
  "whitelist": [
    "827f8c48-cdb2-4105-af39-df5a64f93490", // UUIDs of the players to whitelist
    "7642d15d-2aec-4be8-8cbe-99a53c434248"
  ],
  "operators": ["827f8c48-cdb2-4105-af39-df5a64f93490"] // Players with operator privileges (console and commands access)
}
```
Once you have edited the file save it as `config.json` and start the server.

# Start the server

```bash
$ npm start
```

# Connecting to the WebSocket

Assuming you want to use SolarTweak then go to Patcher then Websocket Option and put **"ws://localhost:your port/connect"** or **"ws://yourip:your port/connect"** if secure is off **"wss://localhost:your port/connect"** or **"wss://yourip:your port/connect"** if secure port is on.
