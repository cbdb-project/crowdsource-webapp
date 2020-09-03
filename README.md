# CBDB Crowdsource
A simple webapp to crowd source information on any fields that supplements or revises current CBDB data.

Supports: 
 - Suggest new value or revise any current field value for CBDB
 - Workflow to review / adopt crowd suggestoins
 - Keyword based auto-suggest per CBDB data (currently only person field)
 - Import new task from a CSV file
 - Export to CSV / TSV (to be merged to CBDB)

## Running the app

### Pulling dependencies
     npm install

### Launching the app
     node src/server.js &
     npm start

     

## File / Directory structure
 - src: source JS / CSS files
 - data: make sure cbdb.db, user.db, task.db etc. are accessible here in order for the app to function.
 - Dockerfile: you can use it to build your own docker container
 - public: public html files

## Pre-packaged Docker Container
Instead of running your own local setup, you could simply pull & run a docker container.

### Example 1

      docker pull tomding/cbdbapp
      docker run --volume="data:/usr/src/cbdbapp/data" --expose 3000 --expose 5000 -p 3000:3000 -p 5000:5000  -it tomding/cbdbapp

The first command pulls the image from docker repo (run once). 
The second one starts the container, and also mounts a Docker volume named "data" onto the app data directory (the data are *required* for the app to function). 
Now it should be available at http://localhost:3000.


### Exmaple 2
If you'd like to serve it on port 80 instead, you could use nginx reverse proxy. Here's an exmaple where we'll be using nginx served by another docker container.

     docker pull jwilder/nginx-proxy        # pull nginx proxy docker
     docker run -d -p 80:80 -v /var/run/docker.sock:/tmp/docker.sock:ro jwilder/nginx-proxy. # run nginx server
     docker run --volume="data:/usr/src/cbdbapp/data" --expose 3000 --expose 5000 -e VIRTUAL_HOST=47.111.230.182 -e VIRTUAL_PORT=3000  -p 3000:3000 -p 5000:5000  -it tomding/cbdbapp:latest 

Note: The "VIRTUAL_HOST" parameter should pointed to your actual hostname or IP address. 

(C) 2020 Lei

