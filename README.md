# Implemented messaging model

## Messaging Protocol
1) Alice generates the encrypted container using Bob’s public key

2) Alice transfers the container to Bob and attaches her PKA as the sender identifier

3) Bob decrypts the container and receives the message

4) As a delivery confirmation, Bob encrypts the message with Alice’s public key 

5) Bob sends the confirmation to Alice

6) Alice decrypts confirmation and receives the message’

7) Alice compares the message’ with the initial message she sent to Bob. If both messages are equal - Alice made sure that Bob received the message.

### Commands to execute
```
npm i
```

```
node alise-server.js
```

```
node bob-server.js
```

Send request with message to Alice server

http://127.0.0.1:8807/send/message?message=HireMe

### Expected ouput
![](/img/2023-06-21_16-56.png "Test")

### To imitate Man In The Middle Attack from Eve`s side
Setup redirect (Example for Ubuntu)

```
sudo iptables -t nat -A OUTPUT -p tcp --dport 8810 -j REDIRECT --to-port 6603
```

Run Eve`s Proxy

```
node eve-proxy.js
```

### Expected ouput
![](/img/2023-06-21_17-25.png "Test")
