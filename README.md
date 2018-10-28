# control-knob

I created this program to control Spotify volume and external monitor brightness using an Arduino Nano and a rotary encoder (KY-040).

It works by listening for serial data sent by the Arduino and then doing things based on the data recieved. To control Spotify volume I use their web API. To control monitor brightness I use the DDC/CI protocol.

I have only tested this on Windows 10 but might work on other platforms.
