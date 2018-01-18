#!/usr/bin/python3
import sys, os
from time import sleep
from subprocess import Popen, PIPE, STDOUT
from module import WebsocketServer



# Mapping command, WebSocket just accept this command (as a prefix)
CMD_MAPS={
	# Keyboard funct
	"K"	: "key",
	"D" : "keydown",
	"U" : "keyup",
	"T" : "type", #enclosed by single quote

	# Mouse func
	"M" : "mousemove_relative",
	"C" : "click",
	"E" : "click --repeat 2", # double click
	"N" : "mousedown",
	"P" : "mouseup"
}
# Default listen address  n port
IP		= "0.0.0.0"
PORT	= 8081
# If debug, use Thread to read output and print to console
DEBUG	= False

for arg in sys.argv[1:]:

	arg = arg.strip('-').lower()

	if arg == "debug":
		DEBUG = True

	elif arg == "help":
		print("Usage: %s [IP:]PORT debug help" % sys.argv[0])
		print("\tIP\tlisten IP default 0.0.0.0")
		print("\tPORT\tlisten port default 8081")
		print("\tdebug\tdefault False")
		print("\thelp\tdisplay this")
		print("")
		print("(!) Must have xdotool version 3 build 2016 and up.")
		exit()

	else: # is an listen address
		s = arg.split(':')
		if len(s) > 1:
			IP = s[0]
			PORT = int(s[1])
		else:
			PORT = int(s[0])

#find xdotool binary location
proc = Popen(['which xdotool'], shell=True, stdout=PIPE)
stdout, stderr = proc.communicate()
xdotool   = stdout.decode().strip()

# if no xdotool binary found
if not xdotool :
	print("xdotool not installed on your system.")
	exit(1)

# Setup required env vars for xdotool
VARS = os.environ.copy()
VARS['DISPLAY'] = ':0'
VARS['XAUTHORITY'] = '%s/.Xauthority' % VARS['HOME']

# Launch xdotool
proc = Popen([xdotool, '-'],
		shell=False,
		stdin=PIPE,
		stdout=PIPE,
		stderr=STDOUT,
		env=VARS,
		bufsize=1,
		universal_newlines=True
	)

sleep(0.2)
# check if not running or killed
poll	= proc.poll();
if poll != None:
	print("xdotool exited with code", poll)
	exit(1)

# Called for every client connecting (after handshake)
def new_client(client, server):
	print("New Client: %d" % client['id'])

# Called for every client disconnecting
def client_left(client, server):
	print("Client: %d disconnected" % client['id'])

# Called when a client sends a message
def message_received(client, server, message):
	poll	= proc.poll();
	if poll != None:
		msg = 'please restart the server, xdotool killed: %d' % poll
		client.send_message(msg)
		print(msg)
		exit(1)
	
	CMD = CMD_MAPS.get(message[0])
	# Just process listed CMD
	if CMD:
		# Prevent from code injection
		if CMD == "type":
			CMD	= CMD + ' "' + message[1:].replace('"', '\\"') + '"'
		else:
			CMD	= CMD + ' ' + message[1:]

		proc.stdin.write(CMD +'\n')
		if DEBUG:
			print(CMD)

	elif DEBUG:
		print('(!) Ignored: ' + message)

# Start WebSocket
server = WebsocketServer(PORT, IP)
print("WebSocket listening on %d " % PORT)

# show xdotool version to Console
proc.stdin.write('version\n')


if DEBUG:
	from module import DebugThread
	# Start output reader for xdotool
	reader = DebugThread(proc.stdout, server)
	reader.setDaemon(True)
	reader.start()

# WebSocket function
server.set_fn_new_client(new_client)
server.set_fn_client_left(client_left)
server.set_fn_message_received(message_received)

server.run_forever()

