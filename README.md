# CSA
Crowdsourcing System for Association Data

 URL: [https://csa.cbdb.fas.harvard.edu](https://csa.cbdb.fas.harvard.edu)

Supports: 
 - Suggest new value or revise any current field value for CBDB
 - Workflow to review / adopt crowd suggestoins
 - Keyword based auto-suggest per CBDB data (currently only person field)
 - Import new task from a CSV file
 - Export to CSV / TSV (to be merged to CBDB)

## Running the app

### Option 1: Docker (recommended)

Pull and run the pre-built container:

    docker pull quay.io/oopus/csa:latest

Run with a Docker named volume:

    docker run -d \
      -v data:/usr/src/cbdbapp/data \
      -p 3000:3000 \
      -p 5001:5001 \
      --restart=always \
      --name csa \
      quay.io/oopus/csa:latest

Or bind-mount a local `data/` directory:

    docker run -d \
      -v $(pwd)/data:/usr/src/cbdbapp/data \
      -p 3000:3000 \
      -p 5001:5001 \
      --restart=always \
      --name csa \
      quay.io/oopus/csa:latest

The `data/` directory must contain the required database files (`cbdb.db`, `tasks.db`, `users.db`). Contact hongsuwang#fas.harvard.edu to obtain them.

- Frontend: http://localhost:3000
- Backend API: http://localhost:5001

To stop / restart:

    docker stop csa
    docker start csa

To rebuild from source:

    docker build -t quay.io/oopus/csa:latest .

### Option 2: Build from GitHub

Build and run directly from the GitHub repository (no need to clone):

    docker build -t csa https://github.com/cbdb-project/crowdsource-webapp.git

    docker run -d \
      -v /path/to/data:/usr/src/cbdbapp/data \
      -p 3000:3000 \
      -p 5001:5001 \
      --restart=always \
      --name csa \
      csa

Replace `/path/to/data` with the absolute path to your `data/` directory.

### Option 3: Local development

1. Replace `./src/config.js` with `./src/config_local.js`
2. Install dependencies:

        npm install

3. Launch:

        node src/server.js &
        npm start

### Production deployment (with TLS)

In production, use a reverse proxy (e.g. Caddy, Nginx) for TLS termination:

    Frontend(port=3000) >>> Reverse Proxy(TLS, port=443/5000) >>> Backend(port=5001)

## File / Directory structure
 - **src**: source JS / CSS files.
 - **data**: database files (`cbdb.db`, `tasks.db`, `users.db`) required for the app to function.
 - **Dockerfile**: build your own Docker container.
 - **public**: public HTML files.

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

[Lei DING](https://github.com/toysrtommy), [Hongsu WANG](https://github.com/sudoghut), [Zihan ZHOU](https://github.com/Zhou-Zihan), [Jimmy WEI](https://github.com/icewing1996), [Xuan ZHANG](https://github.com/MerakDipper)

### Academic Advisors/Contributors

[Peter BOL](https://scholar.harvard.edu/pkbol/home), [Song CHEN](https://www.bucknell.edu/fac-staff/song-chen), [Kwok-leong TANG](https://fairbank.fas.harvard.edu/profiles/kwok-leong-tang), 
[Katherine ENRIGHT](https://github.com/KatherineMEnright)

### License
[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International license](https://creativecommons.org/licenses/by-nc-sa/4.0/)
