# CSA
Crowdsourcing System for Association Data

 URL: [https://csa.cbdb.fas.harvard.edu:81](https://csa.cbdb.fas.harvard.edu:81)

Supports: 
 - Suggest new value or revise any current field value for CBDB
 - Workflow to review / adopt crowd suggestoins
 - Keyword based auto-suggest per CBDB data (currently only person field)
 - Import new task from a CSV file
 - Export to CSV / TSV (to be merged to CBDB)

## Pre-packaged Docker Container
Instead of running your own local setup, you could simply pull & run a docker container.

### Example

      docker pull oopus/csa-local
      docker run --volume="data:/usr/src/cbdbapp/data" --expose 3000 --expose 5000 -p 3000:3000 -p 5000:5000  -it oopus/csa-local

The first command pulls the image from docker repo (run once). 
The second one starts the container, and mounts a Docker volume named "data" onto the app data directory (the data are *required* for the app to function). 

Now it should be available at http://localhost:3000.

If you are a MacOS user, please jump into the ./data directory and run 

      `docker run --mount src="$(pwd)",target=/usr/src/cbdbapp/data,type=bind --expose 3000 --expose 5000 -p 3000:3000 -p 5000:5000  -it oopus/csa-local`

instead of

      `docker run --volume="data:/usr/src/cbdbapp/data" --expose 3000 --expose 5000 -p 3000:3000 -p 5000:5000  -it oopus/csa-local`

