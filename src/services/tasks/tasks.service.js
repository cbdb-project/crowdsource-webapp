const better = require('better-sqlite3')
const cbdb = better('./data/cbdb.db');

const hooks = require('./tasks.hooks.js')
const taskdb = better('./data/tasks.db');
const { BadRequest } = require('@feathersjs/errors');

const {ProposalService} = require('./proposals.service');

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

    _paginate(data, page, perPage, target) {
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

        const filtered = {};
        for (var i = start; i <= end; i++) {
            filtered[keys[i]] = values[i];
        }

        // Set properties if a target is specified
        var props = {

            data: filtered, pages: Math.ceil(keys.length / perPage), total: keys.length

        }
        if (target) {
            Object.assign(target, props);
            return target;
        } else {
            return props;
        }
    }

    _pageOptions(params) {
        var p = {};
        if (!params || !params.query || !params.query.page) {
            p.page = 1;
        } else {
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

    // Return metadata (only) of all tasks
    async find(params) {
        console.log("Task service: find all");
        var q = "select id,author,data from tasks"
        var dt = taskdb.prepare(q).all();
        if (dt.length == 0) {
            return [];
        }
        const tasks = [];
        // console.log(dt);
        
        dt.map((d) => {
            var task = JSON.parse(d.data);
            var t = {id: d.id, title: task.title};
            tasks.push(t)
            console.log(t);
        })
        return tasks;
    }

    async get(id, params) {
        try {
            console.log("Task service: get");
            var q = "select id,author,data from tasks where id=" + id;
            var dt = taskdb.prepare(q).all();
            if (dt.length == 0) {
                return [];
            }
            const { page, perPage } = this._pageOptions(params);

            var orig = dt[0];
            var task = JSON.parse(dt[0].data);
            // const {data, pages, total} = this._paginate(task.data, page, perPage);

            console.log(" -- Per page: " + perPage);
            Object.assign(task, {
                page: page,
                perPage: perPage,
                id: orig.id,
                author: orig.author,
                edited: task.edited ? task.edited : {},
                finalized: task.finalized ? task.finalized : {},

            })

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

            if (!params || !params.query) {
                return this._paginate(task.data, page, perPage, task);
            }

            // Filter to proposals that are being edited (i.e. proposal applied)

            const pq = params.query;
            const pEdited = pq.hasOwnProperty("edited") ? pq.edited.toString() : null;
            const pFinalized = pq.hasOwnProperty("finalized") ? pq.finalized.toString() : null;

            if (pEdited || pFinalized) {
                console.log("Edited + finalized filter: " + pEdited + "/" + pFinalized);
                const filtered = {};
                var pks = Object.keys(task.data);
                console.log(pEdited);
                console.log(task.edited);
                console.log(task.finalized);

                pks = pks.filter((key) => {
                    // console.log(task.edited[key] + "/" + pEdited + (task.edited[key] == pEdited.toString() ));
                    return ((pEdited ? (task.edited[key] === pEdited || (pEdited === "false" && !task.edited[key])) : true)
                        && (pFinalized ? (task.finalized[key] === pFinalized[key] || (pFinalized[key] === "false" && !task.finalized[key])) : true))
                });
                console.log(pks);
                pks.forEach((pk) => { filtered[pk] = task.data[pk] })
                // console.log(filtered);
                task.data = filtered;
            }

            if (pq.hasOwnProperty("proposals")) {

                var ps = pq.proposals === "all" ? "all" : pq.proposals.split(",");
                console.log(task.fields);
                task = await this.mergeProposal(task, ps, pkField);
                // console.log(task.data);
            }

            // Filter to items only with proposals
            if (pq.hasOwnProperty("proposedOnly")) {
                console.log("full proposal  ...");
                // console.log(task.proposals);
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


            // console.log(task);

            return this._paginate(task.data, page, perPage, task);

        } catch (e) {
            console.log(e);
        }
    }


    async markPending(id, pk) {
        const data = await this.getRaw(id);
        delete data.finalized[pk];
        const q = "update tasks set data=json(@data) where id=@id";
        const stmt = taskdb.prepare(q);
        const t = stmt.run({ data: JSON.stringify(data), id: id })
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

        const values = {};
        const props = task.proposals;
        for (var i = 0; i < ps.length; i++) {
            const propItems = ps[i].data;

            // iterate thru each proposal
            for (var k = 0; k < propItems.length; k++) {
                const pkVal = propItems[k][pkField];
                if (!task.proposals[pkVal]) {
                    task.proposals[pkVal] = {};
                }
                if (!values[pkVal]) values[pkVal] = {};
                var keys = Object.keys(propItems[k]);
                keys = keys.filter(key => {
                    if (!props[pkVal][key]) {
                        props[pkVal][key] = [];
                    }
                    if (!values[pkVal][key]) values[pkVal][key] = [];
                    console.log(key);
                    return (new ProposalService()._isUnique(props[pkVal][key], propItems[k][key], task.fields[key]))
                })
                keys.forEach((key) => {
                    if (key === pkField)
                        return;
                    props[pkVal][key].push(propItems[k][key]);
                    // values[pkVal][key].push(propItems[k][key])
                })
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

        // console.log(task);
        const info = await this.getRaw(id);
        console.log("Task::update ... " + id);

        const q = "update tasks set data=json(@data) where id=@id";
        const stmt = taskdb.prepare(q);

        // Update the original data pkg with new updates
        const pks = Object.keys(nData);

        // Update flags
        //   - edited: all rows that are different from initial value
        //   - finalized: all rows that adopted a certain proposal. 
        //                the flag could be flipped back though.

        if (!info.edited)
            info.edited = {};
        if (!info.finalized)
            info.finalized = {};
        for (var i = 0; i < pks.length; i++) {
            info.data[pks[i]] = nData[pks[i]];
            info.edited[pks[i]] = "true";
            info.finalized[pks[i]] = "true";
        }
        console.log("new data to be upated ... ");
        console.log(info);
        const t = stmt.run({ data: JSON.stringify(info), id: id })
        console.log(t);
        console.log("Task::update done");
    }

    // async find() {
    //     try {
    //         var q = "select data from tasks"
    //         var dt = taskdb.prepare(q).all();
    //         var list = [];
    //         for (var i = 0; i < dt.length; i++)
    //             list.push(JSON.parse(dt[dt.length - 1]["data"]));
    //         return list;
    //     } catch (e) {
    //         console.log(e);
    //     }
    // }
}



