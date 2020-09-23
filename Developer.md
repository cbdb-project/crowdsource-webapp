# Developer Documentation

## Stack
Everything is in standard node / JS. Uses
- ReactJS + Bootstrap 4
- FeatherJS (for services)
- Sqlite3


## Structure
## Backend 
All services are servced as standard REST services (by default port 5000), through FeatherJS (which uses ExpressJS underneath)
- src/server.js: Primary entry point. Responsible for pulling in various services and serve them.

**services/**

This is where you can find all services, including ...

 - person/:  (cbdb person search)
 - tasks/: Service for both task and proposals. Each task is a collection of line items to be crowd sourced. A proposal is a collection crowdsource information for a specific task.
 - users/: Services for user and permission (called "abilities") management
 - hooks/: Handling of roles/permissions (contributor, reviewer, admin, guest) and authentication function.
 

## Frontend (using ReactJS)
