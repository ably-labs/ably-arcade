# Ably Arcade

A collection of games built with Ably at their core.

## Rock, paper, scissors

The game has to parts, the player and the host.

- When the webpage loads it will be in player mode, and it will present a form to record user data.
- Host mode is required to collect players and control the game
- There is a "hidden" button that switches to host mode, put the mouse in the top right hand corner of the screen add you will notice a large red box appear. Click that box.
- As users register to compete they will appear in game score board, which is the score panel on the right hand side of the UI.
- Once the respective contestants have all connected, the host needs to click START button to begin the game
- When the game is over the scores will appear on the left hand scoreboard. The person in first positions are potentially prize winners.

## Registration form

The user registration form is hosted by hubspot. Whenever the arcade is used at an event a new form should be created to seperate the data into seperate buckets.
To update the Hubspot formdata [edit this JSON file](./app/hubSpotConfig.json)

## QR code URL

The QR code presumes the demo will be hosted at `arcade.ably.dev`

## Requirements

To run the arcade localhost you need:

- NodeJs & Jest
- [Azure Functions Core Tools](?tabs=v4%2Clinux%2Ccsharp%2Cportal%2Cbash)

## How to run a booth at an event

[See google doc](https://docs.google.com/document/d/100xcsiQs2Il-sztTG6F4IkSu6yB94AVD4PS3HGXJTA4/edit?usp=sharing)
