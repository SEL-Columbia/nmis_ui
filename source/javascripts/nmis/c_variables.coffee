variablesById = {}

class Variable
  constructor: (v)->
    id = v.id || v.slug
    @id     = id
    @name   = v.name

NMIS.variables = do ->
  clear = ()->
    
  load = (variables)->
    list = variables.list
    for v in list
      vrb = new Variable v
      variablesById[vrb.id] = vrb  if vrb.id

  find = (id)-> variablesById[id]

  load: load
  clear: clear
  find: find