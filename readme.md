xdotool Web Based Interface
===========================

> Web Based Keyboard and Mouse Remote Controller

![Screenshot](web/preview.png?raw=true "Title")

How it Works
------------

This web based xdotool work by piping `xdotool -` stdin with WebSocket on port 8081.

HTTP server running on port 8080 to provide web based interface (keyboard button and mouse)


How to Install
--------------

Install this script on target manchine (eg: Raspberry Pi) not on remote manchine.

__Clone this Source:__

    $ git clone https://github.com/ndunks/xdotoolweb

__Run it__

    $ cd xdotoolweb
    $ ./xdotoolweb &

Open browser on remote devices, navigate to http://{IP}:8080

__Stop it__

    $ ctrl+c on terminal or kill it

__Run it and leave terminal or SSH__

    $ nohup ./xdotoolweb &
    $ disown

__Debug output__

    $ ./xdotoolweb --debug &

Tested On :
-------------

__Ubuntu 17.06 on Laptop__

>   xdotool version 3.2016xxxx

Result:
>   Working like expected

__Ubuntu Mate 16.04 on Raspberry Pi 3 Model B__

Problem:
>   Default version of xdotool (3.2015xxx) that available on 
>   default repo is little buggy (buffered input) when using interactive command:
    `xdotool -`

Solution:
>   Compile latest xdotool from source (read section)

Compile xdotool for Raspberry PI (Ubuntu Mate 16.04)
----------------------------------------------------

If you have old xdotool 3.2015xxx so you need to get newest one or compile it with this step:

__Install required header:__

    $ sudo apt-get install libx11-dev libxtst-dev libxinerama-dev libxkbcommon-dev

thanks to __flc__ for share their [gist](https://gist.github.com/flc/5f78a149f451ab746fe4)

__Clone xdotool Source:__

    $ git clone https://github.com/jordansissel/xdotool

__Compile & Install xdotool__

    $ cd xdotool
    $ make
    $ sudo make install

__Third Party Code__

Jordan Sissel: [xdotool](https://github.com/jordansissel/xdotool)

Pithikos: [Python WebSocket Server](https://github.com/Pithikos/python-websocket-server)

flc: [xdotool required header lib](https://gist.github.com/flc/5f78a149f451ab746fe4)
