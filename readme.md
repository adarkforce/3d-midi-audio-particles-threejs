# 3D Particles Music Visualizer with MIDI controls in Three.js

  ![Screenshot](https://github.com/adarkforce/visual-performance/blob/master/readme/screenshot.png)

## Demo

[![DEMO](https://i.imgur.com/BIYZKDg.png)](https://youtu.be/mkEiogFwOYM)
 

## Instructions

- **Audio**
  -  **Audio Input**: Select your audio input.
- **Midi**
  - **MIDI Input**: Select your MIDI interface. 
- **MIDI Mapping**
  - **Storage**
    - **Mapping Name**: Choose a name for your current MIDI mapping preset to Save/Load.
    - **Load Mapping**: Load a MIDI mapping preset from storage with name corresponding to **Mapping Name**.
    - **Save Mapping**: Save the current MIDI mapping preset to storage with name corresponding to **Mapping Name**.
    - **Erase Mapping**: Erase a MIDI mapping preset from storage with name corresponding to **Mapping Name**.
  - **Saved Mappings**: A list with all the currently saved MIDI mappings. Click on one to load it.
  - **New Mapping**: 
    - **Property**: The property of the particles to automate with the new mapping.
    - **Max Value**: The maximum value that the current mapping will reach.
    - **Min Value**: The minimum value that the current mapping will reach.
    - **Current Control**: The last listened midi control id received. Only Control Change Events are supported for now (Means knobs and faders usually).
    - **Start / End Mapping**: Toggle button to start midi mapping. When pressed start listening to midi messages, and when pressed a second time saves the midi mapping, with the associated particles parameter.  
  - **Loaded Mappings**: Shows the list of mappings that have been loaded/created by the user. Clicking on a mapping removes it.
- **Controls**: Manually control the particles parameters.

## Running locally

```bash
# Install dependencies (only the first time)
npm install

# Run the local server at localhost:8080
npm run dev

# Build for production in the dist/ directory
npm run build
```
