const { Ability, ForcedSubject, AbilityBuilder } = require('@casl/ability');
const { Forbidden } = require('@feathersjs/errors')

// const { AbilityBuilder, Ability } = require('casl')

// Ability.addAlias('read', ['get', 'find'])
// Ability.addAlias('manage', 'delete')
// Ability.addAlias('manage', 'update')
// Ability.addAlias('manage', 'create')


const Roles = 'contributor' | 'reviewer' | 'admin';

const rolePermissions = {
    everyone(user, {can, cannot}) {
        can('create', ['users']);
        can("get", ["tasks", "abilities"]);
    },
    contributor(user, { can ,cannot}) {
        can('create', ['proposals'])
        can("get", ["users", "tasks", "abilities"]);

        can("find", ["tasks", "proposals", "person"]);
    }
    , reviewer(user, { can,cannot }) {
        can('manage', ['tasks','proposals'])
        can("get", ["users", "abilities"]);
        can("find", ["tasks", "proposals","person"]);
    }
    , admin(user,{can,cannot}) {
        can("manage", ["all"]);
        // can("get", ["users"]);
    }
}

const defineAbilitiesFor = function defineAbilitiesFor(user) {
    const { can, cannot, build } = new AbilityBuilder(Ability);

    if (!user || !user.role) {
        user = {role: "everyone"};
    }
    if (typeof rolePermissions[user.role] === 'function') {
        rolePermissions[user.role](user, {can, cannot});
        // console.log(build());
    } else {
        throw new Error(`Trying to use unknown role "${user.role}"`);
    }
    return build();
}

module.exports.defineAbilitiesFor = defineAbilitiesFor;

module.exports.authorize = function authorize(name = null) {
    return async function (hook) {
        const action = hook.method
        const service = name ? hook.app.service(name) : hook.service
        const serviceName = name || hook.path

        console.log(action);
        console.log(serviceName);
        hook.params.ability = defineAbilitiesFor(hook.params.user)

        const params = Object.assign({}, hook.params, { provider: null })
    
        // console.log("Target id: " + hook.params);
        if (hook.params.ability.cannot(action, serviceName)) {
            throw new Forbidden(`You are not allowed to ${action} ${serviceName}`)
        }
        return hook;
        // const result = await service.get(hook.id, params)
        // if (action === 'get') {
        //     hook.result = result
        // }
        // return hook
    }
}