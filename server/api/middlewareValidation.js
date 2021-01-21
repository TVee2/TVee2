module.exports.needsSuperAdmin = (req, res, next) => {
  if(req.user.superAdmin){
    next()
  }else{
    res.send("not admin")
  }
}

module.exports.needsAdmin = (req, res, next) => {
  if(req.user.Admin){
    next()
  }else{
    res.send("forbidden")
  }
}

module.exports.needsloggedIn = (req, res, next) => {
  if(req.user){
    next()
  }else{
    res.send("not logged in")
  }
}
