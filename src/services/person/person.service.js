const better = require('better-sqlite3')
const cbdb = better('./data/cbdb.db');

const hooks = require('./person.hooks.js')


module.exports = function person(app) {
    app.use('/person', new PersonService())
    app.service('person').hooks(hooks)
    console.log("hooks installed for person.")
}

class PersonService {

    constructor() {
    }

    async create(data) {
    }

    async get(id, params) {
        try {
            console.log("Person service: get");
            var q= "select b.*  from biog_main b where b.c_personid=" + id;
            var dt = cbdb.prepare(q).all();
            if (dt.length == 0) {
                return {};
            }
            const person = dt[0];
            console.log(JSON.stringify(person));


            q = "select b.*,a.c_addr_id,d.*, a_codes.c_name as c_jiguan,a_codes.c_name_chn as c_jiguan_chn from biog_main b,dynasties d,biog_addr_data a,addr_codes a_codes where b.c_personid=" + id + " and b.c_dy=d.c_dy and b.c_personid=a.c_personid and a_codes.c_addr_id=a.c_addr_id and a.c_addr_type=1"
            var dt = cbdb.prepare(q).all();
            if (dt.length == 0) {
                return person;
            }
            Object.assign(person, dt[0])
            console.log(JSON.stringify(person));
            return person;
            


        } catch (e) {
            console.log(e);
        }

    }
    async find(params) {
        try {
            console.log("Person service: find");
            // console.log(params);
            var kw = "%" + params.query.q.replace(" ","%") + "%"
            var q = "select b.* from biog_main b where b.c_name like @kw or b.c_name_chn like @kw or b.c_personid like @kw limit 20"
            var dt = await cbdb.prepare(q).all({kw:kw});
            // console.log("----------debug--------")
            // console.log(kw,q,dt)

            if (dt.length == 0) {
                return [];
            }
            console.log(dt.length);
            // const person = dt[0];
            // console.log(JSON.stringify(person));

            return dt;


        } catch (e) {
            console.log(e);
        }

    }
}
