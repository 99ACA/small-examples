# Redis Sample

## Typescript

- Use [node-pool](https://github.com/coopernurse/node-pool) `npm i generic-pool`
- Use `npm i ioredis && npm i -D @types/ioredis`

## Redis

- Data Types
  - string
  - lists : [l|r]push/[r|l]pop elements from the list
  - set : collection of string
  - hashes : map string->string
- Action
  - [Transaction](https://redis.io/topics/transactions) (MULTI/EXEC/DICARD/WATCH)
    > All the other clients are blocked during the transaction

## Lua

Ability to run script in redis

- reduce round trip (networking overhead)
- transactions

>Aware that while the script is running no other client can execute commands.

Example embedded Lua script:

```lua
EVAL 'local val="Hello" return val' 0
--          ^                       ^
--          |                       |
--          ^                       ^
--   'lua script ....'              number of keys being passed to the Lua code
EVAL "return ARGV[1]..' '..ARGV[2]..' -> key is: '..KEYS[1]" 1            name:first        "Hi" "there"
--          ^                                                ^               ^               ^     ^
--          |                                                |               |               |     |  
--          ^                                                ^               ^                  ^  
--   'lua script ....'                                number of keys        key value         args value
```

Load script:

```lua
-- The script is guaranteed to stay in the script cache forever (unless SCRIPT FLUSH is called)
SCRIPT LOAD "return ARGV[1]..' '..ARGV[2]..' -> key is: '..KEYS[1]" 1
-- Get Hash: example: 623c9935855a2b56750f831aadef59ce1299d8bb
EVALSHA  623c9935855a2b56750f831aadef59ce1299d8bb 1            name:first        "Hi" "there"
-- Clean all
SCRIPT FLUSH
```
