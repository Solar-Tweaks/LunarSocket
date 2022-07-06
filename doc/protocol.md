# Overview

| Packet ID | Name                                                                                          | Bound to |
| --------- | --------------------------------------------------------------------------------------------- | -------- |
| 2         | ConsoleMessage ([C](#consolemessage-clientbound---2)\|[S](#consolemessage-serverbound---2))   | Both     |
| 3         | [Notification](#notification---3)                                                             | Client   |
| 4         | [FriendList](#friendlist---4)                                                                 | Client   |
| 5         | [FriendMessage](#friendmessage---5)                                                           | Both     |
| 6         | JoinServer ([C](#joinserver-clientbound---6)\|[S](#joinserver-serverbound---6))               | Both     |
| 7         | [PendingRequests](#pendingrequests---7)                                                       | Client   |
| 8         | [PlayerInfo](#playerinfo---8)                                                                 | Client   |
| 9         | FriendRequest ([C](#friendrequest-clientbound---9)\|[S](#friendrequest-serverbound---9))      | Both     |
| 16        | [ReceiveFriendRequest](#receivefriendrequest---16)                                            | Client   |
| 17        | [RemoveFriend](#removefriend---17)                                                            | Server   |
| 18        | [FriendUpdate](#friendupdate---18)                                                            | Client   |
| 20        | [ApplyCosmetics](#applycosmetics---20)                                                        | Server   |
| 21        | FriendResponse ([C](#friendresponse-clientbound---21)\|[S](#friendresponse-serverbound---21)) | Both     |
| 22        | [ToggleFriendRequests](#togglefriendrequests---22)                                            | Server   |
| 24        | [ConstantChanged](#constantchanged---24)                                                      | Server   |
| 25        | [Unused](#unused---25)                                                                        | Unknown  |
| 33        | [ForceCrash](#forcecrash---33)                                                                | Client   |
| 35        | [TaskListRequest](#tasklistrequest---35)                                                      | Client   |
| 36        | [TaskList](#tasklist---36)                                                                    | Server   |
| 39        | [DoEmote](#doemote---39)                                                                      | Server   |
| 40        | [Unknown](#unknown---40)                                                                      | Unknown  |
| 48        | [PlayerInfoRequest](#playerinforequest---48)                                                  | Server   |
| 50        | [UpdateVisiblePlayers](#updatevisibleplayers---50)                                            | Server   |
| 51        | [PlayEmote](#playemote---51)                                                                  | Client   |
| 52        | [Unused](#unused---52)                                                                        | Unknown  |
| 53        | [Unused](#unused---53)                                                                        | Unknown  |
| 54        | [Unused](#unused---54)                                                                        | Server   |
| 55        | [Unused](#unused---55)                                                                        | Unknown  |
| 56        | [EquipEmote](#equipemotes---56)                                                               | Server   |
| 57        | [GiveEmotes](#giveemotes---57)                                                                | Client   |
| 64        | [KeepAlive](#keepalive---64)                                                                  | Server   |
| 65        | [ChatMessage](#chatmessage---65)                                                              | Client   |
| 67        | [HostListRequest](#hostlistrequest---67)                                                      | Client   |
| 68        | [HostList](#hostlist---68)                                                                    | Server   |
| 69        | [Unused](#unused---69)                                                                        | Server   |
| 70        | [Unused](#unused---70)                                                                        | Server   |
| 71        | [Unknown](#unknown---71)                                                                      | Server   |
| 72        | [Unused](#unused---72)                                                                        | Unknown  |
| 73        | [Unknown](#unknown---73)                                                                      | Server   |
| 1056      | [ClientBan](#clientban---1056)                                                                | Client   |

# Clientbound packets

## ConsoleMessage (clientbound) - `2`

Send a message to the player's console.

Note: _supports Minecraft color codes_

```js
{
  message: 'string';
}
```

See [implementation](../src/packets/ConsoleMessagePacket.ts)

## Notification - `3`

Send a pop up notification to the client. Title field can be an empty string. However description cannot.

Note: _supports Minecraft color codes_

```js
{
  title: 'string',
  message: 'string'
}
```

See [implementation](../src/packets/NotificationPacket.ts)

## FriendList - `4`

Packet containing your friend list. Sent at boot by lunar.

Note: _We suppose that the `unknownInt` is for an online friend is the friend's Minecraft version._

Note: _The `online` array seems to be empty every time and another packet is telling if the friend is online._

```js
{
  consoleAccess: 'boolean',
  requestsEnabled: 'boolean',
  online: `Array<{ uuid: string, displayName: string, unknownInt: int, status: string }>`,
  offline: `Array<{ uuid: string, displayName: string, offlineFor: long }>`
}
```

See [implementation](../src/packets/FriendListPacket.ts)

## FriendMessage - `5`

When a friend of the player sends a message.

Note: _The `uuid` field is a string and not an UUID! This is not a mistake_

```js
{
  uuid: 'string',
  message: 'string'
}
```

See [implementation](../src/packets/FriendMessagePacket.ts)

## JoinServer (clientbound) - `6`

Sent when a friend joins a server

Note: _The uuid is always empty when [serverbound](#joinserver-serverbound---6). It's used when the packet is clientbound_

Note: _The `server` field is set to "In Menus" when the friend leaves the server. This field is more status than server imo¯\\\_(ツ)\_/¯_

```js
{
  uuid: 'string',
  server: 'string'
}
```

See [implementation](../src/packets/JoinServerPacket.ts)

## PendingRequests - `7`

Sent by the server when you connect. Contains the list of pending friend requests you have to accept or deny.

```js
{
  bulk: 'JsonString<{ "bulk": [ { "name": "...", "uuid": "..." }, {...} ] }>';
}
```

See [implementation](../src/packets/PendingRequestsPacket.ts)

## PlayerInfo - `8`

Packet containing a player details.
Used in two cases:

- When it tells information about the current player
- When it tells information about other players

Note: _The `equipped` field for cosmetics is ignored when the packet tells information about another player.
Which means lunar sends you only equipped cosmetics_

```js
{
  uuid: 'UUID',
  cosmetics: 'Array<{ id: number, equipped: boolean }>',
  color: 'int',
  unknownBooleanA: 'boolean',
  premium: 'boolean',
  clothCloak: 'boolean',
  showHatAboveHelmet: 'boolean',
  scaleHatWithHeadwear: 'boolean',
  adjustableHeightCosmetics: 'HashMap<int, float>',
  plusColor: 'int',
  unknownBooleanE: 'boolean'
}
```

See [implementation](../src/packets/PlayerInfoPacket.ts)

## FriendRequest (clientbound) - `9`

When the player receives a friend request from someone

Note: _The `uuid` field is a string and not an UUID! This is not a mistake_
Note: _The `uuid` field seems to be empty everytime_

```js
{
  uuid: 'string',
  username: 'string'
}
```

See [implementation](../src/packets/FriendRequestPacket.ts)

## ReceiveFriendRequest - `16`

Sent to the client by the server when you receive a friend request

```js
{
  uuid: 'string',
  name: 'string',
  isAdded: 'boolean'
}
```

See [implementation](../src/packets/ReceiveFriendRequest.ts)

## FriendUpdate - `18`

Sent when a friend connects or disconnects

```js
{
  uuid: 'string';
  name: 'string';
  unknownLong: 'long';
  unknownBoolean: 'boolean';
  version: 'string';
}
```

See [implementation](../src/packets/FriendUpdatePacket.ts)

## FriendResponse (clientbound) - `21`

Sent when a player accepts or denies your friend request

Note: _The `uuid` field is a string and not an UUID! This is not a mistake_

```js
{
  accepted: 'boolean',
  uuid: 'string'
}
```

See [implementation](../src/packets/FriendResponsePacket.ts)

## ForceCrash - `33`

Crashes the client ¯\\\_(ツ)\_/¯

```js
{
}
```

See [implementation](../src/packets/ForceCrashPacket.ts)

## TaskListRequest - `35`

Send a task list request to the client.
The client should send back a [TaskList](#tasklist---36) packet with the data

Note: _yes privacy_

```js
{
}
```

See [implementation](../src/packets/TaskListRequestPacket.ts)

## PlayEmote - `51`

Play the emote animation for someone

```js
{
  uuid: 'UUID',
  id: 'int',
  metadata: 'int'
}
```

See [implementation](../src/packets/PlayEmotePacket.ts)

## GiveEmotes - `57`

Packet containing all player's emotes

```js
{
  owned: 'Array<int>',
  equipped: 'Array<int>'
}
```

See [implementation](../src/packets/GiveEmotesPacket.ts)

## ChatMessage - `65`

When sent, the message field is printed in the player's minecraft chat

Note: _The client also has the write method (which means theoretically this packet could be server bound too) but we never saw this packet being sent by the client_

```js
{
  message: 'string';
}
```

See [implementation](../src/packets/ChatMessagePacket.ts)

## HostListRequest - `67`

Send a host list request to the client.
The client should send back a [HostList](#hostlist---68) packet with the data

Note: _yes privacy_

```js
{
}
```

See [implementation](../src/packets/HostListRequest.ts)

## ClientBan - `1056`

Sent when you get banned from Lunar Client

Note: _There's maybe a serverbound version of this packet since the write methods are in the code_
Note: _Not sure what are those fields used for since it doesn't get send very often lol_

```js
{
  id: 'int',
  username: 'string',
  servers: 'Array<string>'
}
```

See [implementation](../src/packets/ClientBanPacket.ts)

# Serverbound packets

## ConsoleMessage (serverbound) - `2`

Sent when the player sends a message in the Admin Console.

Note: _In order to open the Admin Console, you need to open your friend menu and press <kbd>F1</kbd>.
The `consoleAccess` field ([FriendList](#friendlist---4)) packet should be on `true` as well or you won't be able to open the console._

```js
{
  message: 'string';
}
```

See [implementation](../src/packets/ConsoleMessagePacket.ts)

## FriendMessage - `5`

Sent when the player sends a message to one of his friends

```js
{
  uuid: 'string',
  message: 'string'
}
```

See [implementation](../src/packets/FriendMessagePacket.ts)

## JoinServer (serverbound) - `6`

Sent when the player joins a server

Note: _The uuid is always empty when serverbound. It's used when the packet is [clientbound](#joinserver-clientbound---6)_

Note: _An empty string is set when the player leaves the server_

```js
{
  uuid: 'string',
  server: 'string'
}
```

See [implementation](../src/packets/JoinServerPacket.ts)

## FriendRequest (serverbound) - `9`

Sent when you send a friend request to someone

Note: _The `uuid` field is a string and not an UUID! This is not a mistake_

```js
{
  uuid: 'string',
  username: 'string'
}
```

See [implementation](../src/packets/FriendRequestPacket.ts)

## RemoveFriend - `17`

Sent when you remove a friend from your friendlist

```js
{
  uuid: 'string';
}
```

See [implementation](../src/packets/RemoveFriendPacket.ts)

## ApplyCosmetics - `20`

Sent when you equip a cosmetic or change ClothCloak state

```js
{
  cosmetics: 'Array<{ id: number, equipped: boolean }>',
  clothCloak: 'boolean',
  showHatAboveHelmet: 'boolean',
  scaleHatWithHeadwear: 'boolean',
  adjustableHeightCosmetics: 'Map<Int, Float>',
  unknownInt: 'int',
  petFlipShoulder: 'boolean'
}
```

See [implementation](../src/packets/ApplyCosmeticsPacket.ts)

## FriendResponse (serverbound) - `21`

Sent when uh I don't remember

```js
{
  accepted: 'boolean',
  uuid: 'string'
}
```

See [implementation](../src/packets/FriendResponsePacket.ts)

## ToggleFriendRequests - `22`

Sent by the client when you toggle your friend requests (enable or disable them)

```js
{
  statis: 'boolean';
}
```

See [implementation](../src/packets/ToggleFriendRequestsPacket.ts)

## ConstantChanged - `24`

Sent to socket when a known good constant has been changed in the client, for example the reach constant.

Note: **Packet is unused today**

```js
{
  id: 'int',
  value: 'string'
}
```

See [implementation](../src/packets/ConstantChanged.ts)

## TaskList - `36`

Packet containing the output of the `tasklist.exe` program on Windows..
Sent after receiving the [TaskListRequest](#tasklistrequest---35) packet.

Note: _yes privacy_

```js
{
  tasks: 'Array<string>';
}
```

See [implementation](../src/packets/TaskListPacket.ts)

<details>
  <summary>Example packet</summary>
  <br/>
  
  ```js
  {
    tasks: [
      '',
      'Image Name                     PID Session Name        Session#    Mem Usage',
      '========================= ======== ================ =========== ============',
      'System Idle Process              0 Services                   0          8 K',
      'System                           4 Services                   0      7,292 K',
      'Secure System                  136 Services                   0     46,628 K',
      'Registry                       208 Services                   0     52,132 K',
      'smss.exe                       612 Services                   0      1,228 K',
      'csrss.exe                      872 Services                   0      5,416 K',
      'wininit.exe                   1020 Services                   0      7,136 K',
      'services.exe                   852 Services                   0     16,584 K',
      'LsaIso.exe                    1032 Services                   0      3,688 K',
      'lsass.exe                     1040 Services                   0     28,356 K',
      'svchost.exe                   1244 Services                   0     38,832 K',
      'fontdrvhost.exe               1276 Services                   0      3,216 K',
      'vmms.exe                      2536 Services                   0     32,096 K',
      'NVDisplay.Container.exe       2748 Services                   0     19,492 K',
      'Memory Compression            3124 Services                   0     75,004 K',
      'spoolsv.exe                   3824 Services                   0     17,328 K',
      'MsMpEng.exe                   4220 Services                   0    287,224 K',
      'vgc.exe                       4252 Services                   0     29,972 K',
      'vmcompute.exe                 4688 Services                   0     13,068 K',
      'AggregatorHost.exe            4996 Services                   0      5,560 K',
      'NisSrv.exe                    5984 Services                   0     11,584 K',
      'vmmem                         7496 Services                   0          N/A',
      'GoogleCrashHandler.exe        5796 Services                   0      1,568 K',
      'GoogleCrashHandler64.exe      8556 Services                   0      1,356 K',
      'SearchIndexer.exe             9272 Services                   0     51,500 K',
      'MpCopyAccelerator.exe         5448 Services                   0      6,864 K',
      ...
    ]
  }
  ```
</details>

## DoEmote - `39`

Sent when you are trying to emote

```js
{
  id: 'int';
}
```

See [implementation](../src/packets/DoEmotePacket.ts)

## PlayerInfoRequest - `48`

Sent around every 300ms to request information about other connected players.
The server should send [PlayerInfo](#playerinfo---8) for every player on Lunar Client.

```js
{
  uuids: 'Array<UUID>';
}
```

See [implementation](../src/packets/PlayerInfoRequestPacket.ts)

## UpdateVisiblePlayers - `50`

Around every 150ms the client sends this packet to tell the server what players they current see.
The whole list isn't sent everytime, only the difference.

```js
{
  players: 'Array<UUID>';
}
```

See [implementation](../src/packets/UpdateVisiblePlayersPacket.ts)

## EquipEmotes - `56`

Sent when you equip an emote

Note: _the packet is only sent when you leave the emote menu (not the selector)_

```js
{
  emotes: 'Array<int>';
}
```

See [implementation](../src/packets/EquipEmotesPacket.ts)

## KeepAlive - `64`

Packet used to keep the connection alive
Packet containing all your mods and their state (whether they are enabled or not)

Note: _The packet is sent every 30 seconds by the client_

```js
{
  mods: 'Map<string, boolean>',
  game: 'string'
}
```

See [implementation](../src/packets/KeepAlivePacket.ts)

## HostList - `68`

Packet containing your `hosts` file.

Note: _this packet was introduced to prevent players from overriding lunar client domains and using custom websockets/api without modifying the game_

Note: _yes privacy_

```js
{
  hosts: 'Array<string>';
}
```

See [implementation](../src/packets/HostListPacket.ts)

<details>
  <summary>Example packet</summary>
  <br/>

```js
{
  hosts: [
    '127.0.0.1 example.com',
    '127.0.0.1 anotherdomain.com',
    '127.0.0.1 www.youtube.com',
  ];
}
```

</details>

# Unused packets

## Unused - `25`

??

```js
{
  data: 'Array<bytes>';
}
```

See [implementation](../src/packets/PacketId25.ts)

## Unused - `52`

??

```js
{
  uuid: 'UUID',
  isFlying: 'boolean'
}
```

See [implementation](../src/packets/PacketId52.ts)

## Unused - `53`

??

```js
{
}
```

See [implementation](../src/packets/PacketId53.ts)

## Unused - `55`

??

```js
{
  unknownCollectionA: 'Collection<long>';
  unknownCollectionB: 'Collection<long>';
}
```

See [implementation](../src/packets/PacketId54.ts)

## Unused - `55`

??

```js
{
}
```

See [implementation](../src/packets/PacketId55.ts)

## Unused - `69`

??

```js
{
}
```

See [implementation](../src/packets/PacketId69.ts)

## Unused - `70`

??

```js
{
}
```

See [implementation](../src/packets/PacketId70.ts)

## Unused - `72`

??

```js
{
}
```

See [implementation](../src/packets/PacketId72.ts)

# Unknown packets

## Unknown - `40`

??

```js
{
  unknownBoolean: 'boolean';
}
```

See [implementation](../src/packets/PacketId40.ts)

## Unknown - `71`

Apparently the first field is a server ip (not sure).

```js
{
  unknownStringA: 'string';
  unknownStringB: 'string';
}
```

See [implementation](../src/packets/PacketId71.ts)

## Unknown - `73`

??

```js
{
  unknownList: 'Array<int>';
}
```

See [implementation](../src/packets/PacketId73.ts)
