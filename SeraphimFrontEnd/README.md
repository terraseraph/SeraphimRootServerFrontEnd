# SeraphimFrontEnd

This is an angular project that relies on the Seraphim Root Server.

## Installing

Navigate to the project directory, and run `npm install` this "should" install the proper packaged required.

- Note \* This was built using Node 10.15.0

## Running

To run, navigate to the project directory, and run `npm start` This will start up an AOT (Ahead Of Time compiled) local angular server on port 4201.

## Using the UI

## Build

Run `npm run-script build` The build artifacts will be stored in the `dist/app`. TS errors may appear not finding mappings, this is fine. To manually run the built server run `node server.js`.

## Build Standalone Executable

Run `npm run-script build-exe`, this will build an executable for the current host platform.

## Angular Serve

Run `npm run-script ng-aot-server` This will run the angular server uting the Ahead of time compiler. Useful for development. Does not build to dist, this is a dev function only.

## Angular only build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

Needs work here......

## Quick rundown

- Add a Branch server
- Create a script
- add script to branch sever
- script will appear in the overview
- Refreshing the page might help where things dont update correctly
