
// i think return is used if don not catch an error so it should return result
module.exports=(func)=>{
    return (req, res, next)=>{
        func(req, res, next).catch(e=>{next(e)})
    }
}