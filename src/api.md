# CBDB Server APIs
-- Outdated. Need Update!--

### search(keyword)
Searching for people documents using Elastic Search db.

### get_task(id)
Get specified task information.

Field:
 - id: task id. if specified, cannot use other criterias.

### get_tasks(status, keyword, requestor)
Get all collab tasks. 

Optional field:
 - status: open, closed
 - keyword: string

### get_proposal(id)
Get specified proposal information.

Optional field:
 - pid: id of the proposal

### get_proposals(task_id, author)
Get all proposals.

Optional field:
 - task_id: proposals for specified task id only

### Task response object
- task_id (unique)
- title: e.g. "Identify authors of correspondences with 张邦奇"
- type: "revise" (revising fields of an item), "add" (add new items), "remove" (flag items for removal)
- fields: list[] of fields both presented & inputtable by user. mandatory if src_type="json".
- src_type: source of the data to operate upon for revisions - support "db_table" or "json"
- src_data: list[] of task_field if "json", or db_table if "cbdb"
- op_fields: list of field object. Fields applicable for revision proposals.

#### task_field object
Specifies a field for the task. It could be user inputtable or not.

- name: user-friendly field name, e.g. "Letter title"
- input: "true" or "false". whether allows for user proposal input.
- field_name: the field name for proposal. Must match either the cbdb field name, or json src_data
- type: "int", "number", "string"
- validators (optional): if input= true, you could specify a list[] of validators.
    - condition: "and", "or"
    - type: "in_json" or "in_table"
    - data: a list[] of permissible data (in_json type) , or db_table object (in_table)

#### db_table object
Specifies a data source from database table (and optional search conditions).

- c_table_name: Target CBDB raw table name upon which to propose data point, e.g "assoc_data"
- field_map: "*" (if all cbdb table fields' name same as field name) or a map{} of:
    - field_name: e.g. "personid"
    - type: "field", "join"
    - c_field_name (optional): e.g. "c_personid" 
    - c_join (optional): [c_table, c_field_name, c_fk]
        - fc_table: (cbdb) foreign table name, e.g. "biog_main". 
        - fc_field: (cbdb) foreign table field,e.g. "c_assoc_code". 
        - fc_pk: e.g. "c_personid". Specify the foreign key.
        - fc_fk: e.g. "c_personid". Specify the foreign key.

- filters: (optional) list[] of 
    - c_field_name: e.g. "c_assoc_code". Raw Field name in CBDB tables.
    - c_field_value: e.g. "=437". Field value to be matched. 

### Proposal response object
- proposal_id
- status: "created", "approved"
- task_id
- values: map of proposed field values
- evidence: in support of the proposal
- author: author id
- created: datetime created

#### Field object
- name: user-friendly name for presentation , e.g. "Author of the letter"
- value: Proposed value for the field
- c_field_name: Raw CBDB field name to be operated upon (if proposal accepted), e.g. "c_assoc_id"
- type: "string" (any string), "number", "in_table" (valid only if exists in a cbdb table)
- in_table_field (optional): field name (e.g. "c_personid") if permissible = "in_table"
- in_table_name (optional): table name (e.g. "biog_main") if permissible = "in_table"


