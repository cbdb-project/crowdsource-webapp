const better = require('better-sqlite3')
const cbdb = better('./cbdb.db');

const hooks = require('./tasks.hooks.js')
const taskdb = better('./tasks.db');
const { BadRequest } = require('@feathersjs/errors');



module.exports = function tasks(app) {
    app.use('/tasks', new TaskService())
    app.service('tasks').hooks(hooks)
    console.log("hooks installed for tasks.")
    app.use('/proposals', new ProposalService())
    console.log("loaded proposal service.")
}

class TaskService {

    constructor() {
        // super();
    }

    async create(data) {
    }

    _paginate(data, page, perPage) {
        page -= 1;
        if (page < 0) {
            page = 0;
        }
        var start = page * perPage;
        var end = start + perPage - 1;

        const values = Object.values(data);
        const keys = Object.keys(data);
        
        if (end > keys.length)
            end = keys.length;

        // data.length = Object.keys(data).length;

        const filtered = {};
        // console.log(start);
        // console.log(keys.length);
        for (var i = start; i <= end; i ++) {
            filtered[keys[i]] = values[i];
        }
        // console.log(filtered);

        return {data: filtered, pages: Math.ceil(keys.length / perPage), total: keys.length};
    }

    _pageOptions(params) {
        var p = {};
        if (!params || !params.query || !params.query.page) {
            p.page = 1;
        }else {
            p.page = params.query.page
        }
        if (!params || !params.query || !params.query.perPage) {
            p.perPage = 25;
        } else {
            p.perPage = params.query.perPage;
        }
        
        
        return p;
    }

    async getRaw(id) {
        console.log("Task service: getRaw");
            
        var q = "select id,author,data from tasks where id=" + id;
        var dt = taskdb.prepare(q).all();
        if (dt.length == 0) {
            return [];
        }
        const task = JSON.parse(dt[0].data);
        return task;
    }

    async get(id, params) {
        try {
            console.log("Task service: get");
            
            var q = "select id,author,data from tasks where id=" + id;
            var dt = taskdb.prepare(q).all();
            if (dt.length == 0) {
                return [];
            }
            const {page, perPage} = this._pageOptions(params);
            
            var task = JSON.parse(dt[0].data);
            const {data, pages, total} = this._paginate(task.data, page, perPage);
            Object.assign(task, {
                page: page,
                perPage: perPage,
                data: data,
                pages: pages,
                total: total,
                id: dt[0].id,
                author: dt[0].author
            })
            // task.page = 
            // task.data = data;
            // task.pages = pages;
            // task.total = total;
            // task.id = dt[0].id;
            // task.author = dt[0].author;
            
            
            const fields = Object.entries(task.fields);
            // Find the primary key
            var pkField, pkCol;
            for (var i = 0; i < fields.length; i++) {
                // console.log(" ++ " + fields[i][1].type);
                if (fields[i][1].type === "key") {
                    pkField = fields[i][0];
                    pkCol = i;
                }
            }
            console.log("pk name = " + pkField);
            task.pkField = pkField;
            task.pkCol = pkCol;

            if (!params || !params.query || !params.query.hasOwnProperty("proposals") || params.query.proposals.split(",").length == 0) {
                return task;
            }
            var ps = params.query.proposals === "all" ? "all" : params.query.proposals.split(",");

            task = await this.mergeProposal(task, ps, pkField);
            console.log(task.data);

            // Filter to items only with proposals
            if (params && params.query && params.query.hasOwnProperty("proposedOnly")) {
                console.log("full proposal  ...");
                console.log(task.proposals);
                const filtered = {};
                const props = Object.keys(task.proposals);
                const dataIds = Object.keys(task.data);
                const intersect = dataIds.filter(value => props.includes(value))

                for (var i = 0; i < intersect.length; i++) {
                    filtered[intersect[i]] = task.data[intersect[i]];
                }
                task.data = filtered;

            }
            console.log("Filtered proposal ...");

            console.log(task);

            return task;
        } catch (e) {
            console.log(e);
        }
    }

    async mergeProposal(task, ps, pkField) {
        task.proposals = {};

        if (ps === "all") {
            ps = await new ProposalService().byTaskId(task.id);
        } else {
            for (var i = 0; i < ps.length; i++) {
                var pid = ps[i];
                ps[i] = (await new ProposalService().get(parseInt(pid))).data;
            }
        }

        // Merge with all proposal values 
        for (var i = 0; i < ps.length; i++) {

            const propItems = JSON.parse(ps[i].data);

            for (var k = 0; k < propItems.length; k++) {
                const pkVal = propItems[k][pkField];
                if (!task.proposals[pkVal]) {
                    task.proposals[pkVal] = [];
                }
                task.proposals[pkVal].push(propItems[k]);
            }
        }
        console.log(" === Get === with proposals merged ===");
        console.log(JSON.stringify(task.proposals, null, 4));
        console.log(" === end === ");
        return task;


    }

    /* Update line items in a task
       e.g.
       task.data: {
           '35': [
            "張邦奇",
            "1",
            "與余子華",
            "致書Y",
            "余本",
            "128347"
           ]
        }
    */
    async update(id, nData, params) {
        const task = await this.getRaw(id);
        // console.log(task);
        const info = task;
        console.log("Task::update ... " + id);

        const q = "update tasks set data=json(@data) where id=@id";
        const stmt = taskdb.prepare(q);

        // Update the original data pkg with new updates
        const pks = Object.keys(nData);

        for (var i = 0; i < pks.length; i++) {
            info.data[pks[i]] = nData[pks[i]];
        }
        console.log("new data to be upated ... ");
        console.log(info);
        const t = stmt.run({ data: JSON.stringify(info), id: id })
        console.log(t);
        console.log("Task::update done");
    }

    async find() {
        try {
            var q = "select data from tasks"
            var dt = taskdb.prepare(q).all();
            var list = [];
            for (var i = 0; i < dt.length; i++)
                list.push(JSON.parse(dt[dt.length - 1]["data"]));
            return list;
        } catch (e) {
            console.log(e);
        }
    }
}

class ProposalService {
    constructor() {

    }


    async byTaskId(tid) {
        console.log("Proposal service: by task id");
        var q = "select * from proposals where task_id=" + tid;
        var dt = taskdb.prepare(q).all();
        if (dt.length == 0) {
            return [];
        }
        return dt;

    }

    async get(id) {
        console.log("Proposal service get =" + id)
        const q = "select * from proposals where id=" + id;
        const st = taskdb.prepare(q);
        const p = st.all()[0];
        p.data = JSON.parse(p.data);
        console.log(p);
        return p;
    }

    /* 
    * Create new proposal
    * Requires proposal.{task_id, values, author}
    * 
    */
    async create(proposal, params) {
        console.log(proposal);
        if (!proposal.hasOwnProperty("task_id") || !proposal.hasOwnProperty("data") || !proposal.hasOwnProperty("author")) {
            const error = "Error creating new proposal: missing task_id, data, or author";
            console.log(error);
            return Promise.reject(new BadRequest(error));
        }
        try {
            await this.validateProposal(proposal)
            const created = new Date();
            const q = "insert into proposals(task_id, author, lastupdate, data) values(@task_id,@author,date('now'), json(@data));"
            const st = taskdb.prepare(q);
            const r = st.run({ task_id: proposal.task_id, author: proposal.author, data: JSON.stringify(proposal.data) });
            console.log(r);
            console.log("Inserted proposal");
        } catch (e) {
            return Promise.reject(e);
        }
    }



    async _valProposalField(def, value) {
        const type = def.type;
        console.log(" - Validating field ... " + def.field_name + " @" + type);
        if (type == "number" && isNaN(value)) {
            throw new Error("Field " + def.field_name + "'s value not a number: " + value);
        } else if (type == "int" && (isNaN(value) || !Number.parseInt(value))) {
            throw new Error("Field " + def.field_name + "'s value not an int: " + value);
        }

        const validators = ProposalService._validators[type];
        for (var i = 0; validators && i < validators.length; i++) {
            console.log(" + validator: " + validators[i]);
            const v = validators[i];
            if (v.type == "in_json" && !(v.includes(value))) {
                throw new Error("Field " + def.field_name + "'s value does not match enumerator list");
            }
            else if (v.type == "in_table") {
                console.log("permissible in table ... ");
                const condition = " where " + v.table_field + "=" + value;
                const q = "select * from " + v.table_name + condition;
                console.log(q);
                const dt = cbdb.prepare(q).all();
                if (dt.length == 0) {
                    throw new Error("Field value not found in specified table");
                }
            }
        }

    }

    async validateProposal(p) {
        var tid = p.task_id;
        var task = await new TaskService().get(tid);
        var tfs = task.fields;
        var pfs = p.data;
        for (var j = 0; j < pfs.length; j++) {
            var pf = pfs[j];
            var fields = Object.entries(pfs[j]);
            for (var z = 0; z < fields.length; z++) {
                var field = fields[z][0];
                var value = fields[z][1];
                if (!tfs.hasOwnProperty(field)) {
                    throw new Error("Proposal field not found in original task: " + field)
                }
                await this._valProposalField(tfs[field], value);
            }
        }
    }

    static _validators = {
        "person": [{
            operator: "and",
            type: "in_table",
            table_name: "biog_main",
            table_field: "c_personid"
        }

        ],
        "string": [],
        "int": [],
        "number": [],
    }

}


