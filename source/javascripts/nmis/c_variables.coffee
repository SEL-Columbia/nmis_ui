variablesById = {}

class Variable
  constructor: (v)->
    id = v.id || v.slug
    @id     = id
    @name   = v.name
    @data_type = v.data_type || "float"
    @precision = v.precision || 2

class NMIS.VariableSet
  constructor: (variables)->
    log "created new variable set for lga"
    @variablesById = {}
    list = variables.list
    for v in list
      vrb = new Variable v
      @variablesById[vrb.id] = vrb  if vrb.id

  ids: ()->
    key for key, val of @variablesById

  find: (id)-> @variablesById[id]
