# CBDB Crowdsource
A simple webapp to crowd source information on any fields that supplements or revises current CBDB data.

Supports: 
 - Suggest new value or revise any current field value for CBDB
 - Workflow to review / adopt crowd suggestoins
 - Keyword based auto-suggest per CBDB data (currently only person field)
 - Import new task from a CSV file
 - Export to CSV / TSV (to be merged to CBDB)
 

## Pre-packaged Docker Container
Instead of running your own local setup, you could simply pull & run a docker container.

### Example 1

      docker pull tomding/cbdbapp
      docker run --expose 3000 --expose 5000 -it tomding/cbdbapp:latest 

The first command pulls the container from docker repo (run once). The second one serves the container. The app will now be available on your local port 3000. 


### Exmaple 2
If you'd like to serve it on port 80 instead, you could use nginx reverse proxy. Here's an exmaple where we'll be using nginx served by another docker container.

     docker pull jwilder/nginx-proxy        # pull nginx proxy docker
     docker run -d -p 80:80 -v /var/run/docker.sock:/tmp/docker.sock:ro jwilder/nginx-proxy. # run nginx server
     docker run --expose 3000 --expose 5000 -e VIRTUAL_HOST=47.111.230.182 -e VIRTUAL_PORT=3000  -p 3000:3000 -p 5000:5000  -it tomding/cbdbapp:latest 

(C) 2020 Lei

