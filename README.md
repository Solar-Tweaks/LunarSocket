# LunarSocket

Lunar Socket is a Websocket server for Lunar Client.
It allows you to proxy the connection between Lunar Client and Lunar Servers. (To give you cosmetics or emotes for example)

Lunar Client &lt;-> Lunar Socket &lt;-> Lunar Servers

It intercepts and edits the data in sent packets.

# 🔖 Protocol

You can see Lunar Client protocol detailed [here](https://github.com/Solar-Tweaks/LunarSocket/blob/main/doc/protocol.md)

# ⬇️ Installation

```bash
$ git clone https://github.com/Solar-Tweaks/LunarSocket # Clone repo
$ cd LunarSocket # Go to LunarSocket folder
$ npm install # Install dependencies
$ npm run build # Build the project

# For the dashboard
$ cd dashboard # Go to the dashboard folder
$ npm install # Install dependencies
$ npm run build
```

# 💻 Installation using Script

```bash
$ git clone https://github.com/Solar-Tweaks/LunarSocket # Clone repo
$ cd LunarSocket # Go to LunarSocket folder
$ npm install # Install dependencies
$ npm run init # Execute the init script
```

or

```bash
git clone https://github.com/Solar-Tweaks/LunarSocket && cd LunarSocket && npm install && npm run init
# Do the script installation but with just 1 command
```

# 🔧 Configuration

Open the `config.example.json` file and edit the values.
Once you have edited the file, save it as `config.json` and start the server.

# 📂 Databases

There are a few types of databases available:

- `instanceStorage` - Stores the data in the Lunar Socket instance which means that the data will be deleted when the server is restarted/stopped/updated.
- `mongo` - Stores the data in a MongoDB database.
- `fileStorage` - Stores the data in the provided json file.
- `Redis` - Stores the data in a Redis database; (Requires RedisJson)

# 🚀 Starting the server

```bash
$ npm start
```
