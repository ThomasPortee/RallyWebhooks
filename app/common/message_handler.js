const transformFields = (fields) => {
    var transformed_hash = {}
    
    for ( var i in fields ) {
        var field = fields[i]
        var name = field.name || i
        
        transformed_hash[name] = field
    }
    
    return transformed_hash
}

module.exports.transformFields = transformFields;