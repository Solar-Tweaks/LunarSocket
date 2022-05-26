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
  "server": {
    "port": 80, // Port of the server
    "secure": false, // Whether or not to enable SSL (wss protocol)
    "certificates": {
      // Certificates path (only if secure is true)
      "key": "path/to/key",
      "cert": "path/to/cert"
    }
  },
  "whitelist": {
    "enabled": true, // Whether or not the enable whitelist
    "list": [
      // UUIDs of the players to whitelist
      "827f8c48-cdb2-4105-af39-df5a64f93490",
      "7642d15d-2aec-4be8-8cbe-99a53c434248"
    ]
  },
  "welcomeMessage": "LunarSocket made by SolarTweaks with love <3", // Message sent to the player when they connects
  "database": {
    "type": "instanceStorage", // See database section
    "config": {
      "mongo": "mongodb://<password>@localhost:27017" // MongoDB connection string
    }
  },
  "roles": {
    "admin": {
      "console": true,
      "iconColor": "0xff0000",
      "plusColor": "0xffc800"
    },
    "default": {
      // Default role don't remove!!! Custom roles go above
      "console": false, // Whether or not the role can see the console
      "iconColor": "0xffffff", // Color of the role icon
      "plusColor": "0x00ff00" // Color of the role plus
    }
  }
}
```

Once you have edited the file save it and rename it to `config.json` and then go to start the server part.

## Database

There's two types of databases available:

- `instanceStorage` - Stores the data in the Lunar Socket instance which means that the data will be deleted when the server is restarted/stopped/updated.
- `mongo` - Stores the data in a MongoDB database.

# Start the server

Don't forget to change your websocket to `ws://localhost:80/connect` in Solar Tweaks patcher!

```bash
$ npm start
```
