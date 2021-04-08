# CSA
Crowdsourcing System for Association Data

 URL: [https://csa.cbdb.fas.harvard.edu:81](https://csa.cbdb.fas.harvard.edu:81)

Supports: 
 - Suggest new value or revise any current field value for CBDB
 - Workflow to review / adopt crowd suggestoins
 - Keyword based auto-suggest per CBDB data (currently only person field)
 - Import new task from a CSV file
 - Export to CSV / TSV (to be merged to CBDB)

## Running the app

### Setup local environment
Replace the content in ./src/**config**.js by ./src/**config_local**.js

### Pulling dependencies
     npm install

### Launching the app
     node src/server.js &
     npm start

## File / Directory structure
 - **src**: source JS / CSS files.
 - **data**: make sure cbdb.db, user.db, task.db etc. are accessible here in order for the app to function.
 - **Dockerfile**: you can use it to build your own docker container.
 - **public**: public html files.
 
 Please contact hongsuwang#fas.harvard.edu to get the files in ./data.

## Pre-packaged Docker Container
Instead of running your own local setup, you could simply pull & run a docker container.

### Example

      docker pull oopus/csa-local
      docker run --volume="data:/usr/src/cbdbapp/data" --expose 3000 --expose 5000 -p 3000:3000 -p 5000:5000  -it oopus/csa-local

The first command pulls the image from docker repo (run once). 
The second one starts the container, and mounts a Docker volume named "data" onto the app data directory (the data are *required* for the app to function). 

Now it should be available at http://localhost:3000.

If you are a MacOS users, please jump into the ./data directory and run 

      `docker run --mount src="$(pwd)",target=/usr/src/cbdbapp/data,type=bind --expose 3000 --expose 5000 -p 3000:3000 -p 5000:5000  -it oopus/csa-local`

instead of

      `docker run --volume="data:/usr/src/cbdbapp/data" --expose 3000 --expose 5000 -p 3000:3000 -p 5000:5000  -it oopus/csa-local`

## Task CSV Format
### First line: column specification (mandatory)
The first line of the CSV should be (column_name) or (column_name=column_type), where:
- column_type should be one of the following: blank (which defaults to "string"), "key" (i.e. primary key), "person" (a cbdb person), "string" (any arbitrary string), "int" (integer)
- One (and only one) of the columns should be of "key" type

Here's a valid example:

    line=key,writer,sequence,person_id,title,assoc_type=string,assoc_name_chn=string,assoc_personid=person

And an invalid one: 

    line=key,writer=key,sequence,person_id,title,assoc_type=,assoc_name_chn=string,assoc_personid=person

*Problems*: multiple primary keys ("line" and "writer"), and empty column type ("assoc_type")

### Second line: user friendly column name (mandatory)
Those are the column names presented to end user. 

### Examples

      line=key,writer,sequence,person_id,title,assoc_type=string,assoc_name_chn=string,assoc_personid=person,assoc_count=int,assoc_year=int,nianhao=string,year=int,range=string,collection,c_source,volume
      行号,作者,序列,人物id,标题,关联类型,关联类型描述,关联人物,关联次数,关联年份,年号,公元年,范围,文集,出处,卷
      51,羅倫,1,34531,在告與三閤老,致書Y,,,,,,,,一峰先生文集,7204,8
      52,羅倫,2,34531,在告與崔冡宰,致書Y,,,,,,,,一峰先生文集,7204,8
      53,羅倫,3,34531,與李賔之,致書Y,李東陽,28691,,,,,,一峰先生文集,7204,8
      54,羅倫,4,34531,與劉用光,致書Y,劉煊,199087,,,,,,一峰先生文集,7204,8
      55,羅倫,5,34531,復胡提學書,答Y書,,,,,,,,一峰先生文集,7204,8




### Technical Contributors

[Lei DING](https://github.com/toysrtommy), [Hongsu WANG](https://github.com/sudoghut), [Zihan ZHOU](https://github.com/Zhou-Zihan), [Jimmy WEI](https://github.com/icewing1996)

### Academic Advisors/Contributors

[Peter BOL](https://scholar.harvard.edu/pkbol/home), [Song CHEN](https://www.bucknell.edu/fac-staff/song-chen), [Kowk-leong TANG](https://fairbank.fas.harvard.edu/profiles/kwok-leong-tang)

### License
[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International license](https://creativecommons.org/licenses/by-nc-sa/4.0/)

(C) 2021 CBDB Open-Source Community, Lei


