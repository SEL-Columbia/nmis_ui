variablesById = {}

class Variable
  constructor: (v)->
    id = v.id || v.slug
    @id     = id
    @name   = v.name
    @data_type = v.data_type || "float"
    @precision = v.precision || 1
    @context = v.context || null

NMIS.variables = do ->
  clear = ()->
    
  load = (variables)->
    list = variables.list
    for v in list
      vrb = new Variable v
      variablesById[vrb.id] = vrb  if vrb.id

  ids = ->
    key for key, val of variablesById

  find = (id)-> variablesById[id]

  load: load
  clear: clear
  ids: ids
  find: find
