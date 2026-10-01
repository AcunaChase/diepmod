# <img src="logo.svg" width="36" align="top" alt=""> Hexlock

A Chrome extension mod menu for [diep.io](https://diep.io) that auto-farms shapes by reading the game canvas.

## Features

- **Auto-Farm**: aims and fires at the nearest shape automatically
- **Target picker**: all shapes, or only squares, triangles or hexagons
- **Show Targets**: crosshair, label and line to the current target
- **Spinner**: sweeps your aim in a circle while firing
- **Draggable menu**

## How it works

1. Grabs the game canvas with `getImageData` and samples every 3rd pixel
2. Sorts pixels into squares (yellow), triangles (red) and hexagons (blue) by color range, skipping player red `rgb(241, 78, 84)`
3. Picks the shape closest to the center of the screen (your tank)
4. Sends synthetic mouse events to aim and shoot, every 30 ms

## Install

1. Download `hexlock-extension.zip` and unzip it (or clone this repo)
2. Go to `chrome://extensions`
3. Turn on **Developer mode**
4. Click **Load unpacked** and pick the `extension` folder
5. Open diep.io

## Files

```
extension/
  manifest.json   Manifest V3 config, runs on diep.io
  content.js      Menu, pixel scanner and auto-aim loop
  icon*.png       Extension icons
index.html        Project page (GitHub Pages)
logo.svg          Logo and favicon
```

## Note

Personal learning project in browser extensions and canvas image processing. Using bots may break a game's rules, so use at your own risk.
