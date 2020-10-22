# Developer Documentation

## Stack
Everything is in standard node / JS, built with:
- ReactJS + Bootstrap 4
- [FeatherJS](https://docs.feathersjs.com/) (for services)
- Sqlite3

## Pointers for quick changes 
 - Change port number: search port 5000 in src/server.js
 - Change CBDB page link: In src/views/Layout/DefaultLayout.js

       window.cbdbLink = (id) => {
         return "http://47.114.119.106:8000/basicinformation/" + id + "/edit";
       }

 - Add / remove header navigation items: In views/Layout/DefaultHeader.js, add / remove items like this: 

        <Can I="manage" a="tasks" ability={userAbility}>
           <NavItem className={" "+ this.navStyle("import")} onClick={this.navClicked.bind(this, "import")}>
                   <Link to="/import" className="nav-link">Import a task</Link>
           </NavItem>
        </Can>
     
     Note: First line defines permission required for this item. 

## Backend 
All services are structured as standard REST services (by default port 5000), through FeatherJS (which uses ExpressJS underneath).

- src/server.js: Primary entry point. Responsible for pulling in various services and serve them.
- src/import.js: csv import module
- src/prep_tasks.js: Run this file to create db schema & a few data items.

**services/**
This is where you find all unerlying services, including ...
 - person/: CBDB person search
 - tasks/: Service for both task and proposals. Each task is a collection of line items to be crowd sourced. A proposal is a collection crowdsource information for a specific task.
 - users/: Services for user and permission (called "abilities") management
 - hooks/: Handling of roles/permissions (contributor, reviewer, admin, guest) and authentication function.
 

## Frontend (using ReactJS)
### src/
 - routes.js: Modify this file to add/remove new pages for routing.
 
### src/scss/
 - "__custom.scss": Apart from Bootstrap standard scss, all custom CSS are added here.
 
### src/views/DefaultLayout
 - DefaultLayout.js: This is the main file that renders every page: which embeds DefaultHeader, DefaultFooter, and one of the component files invoked (under src/views). Client authentication code is also handled here.
 
### src/views
 - Tasks: Task main crowdsourcing page. As well as Import and Export page.
 - Proposals: Proposal page and its various components.
 - Manage: User and task management.
 - Pages: common pages incl. Login, Register, etc.

 
