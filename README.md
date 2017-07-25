# KSPP
Party Pack Game Service

# API:  
  
## File Structer  
  
Game folders are placed in 'root/Games' by default (can be changed in config.js), the game folder layout is:
  
* gameRoot  - any name
  * /public  - All public files such as images and css
  * /views  -  Jade view files
  * config.json - Game config file, needed for author and game details
  * game.js  -  This is the start point when a game is ran
