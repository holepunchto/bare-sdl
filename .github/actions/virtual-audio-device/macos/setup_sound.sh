#!/bin/bash

set -xeo pipefail

brew fetch --retry --cask background-music
brew install --cask background-music
brew install switchaudio-osx blackhole-2ch

sudo launchctl kickstart -kp system/com.apple.audio.coreaudiod || sudo killall coreaudiod

sleep 10

SwitchAudioSource -s 'BlackHole 2ch' -t input
SwitchAudioSource -s 'BlackHole 2ch' -t output
