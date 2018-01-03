(function(){
  var log = console.log

  var append_to_DOM = function(msg){
    var el
    el = document.createElement('pre')
    el.innerHTML = msg
    document.body.appendChild(el)
  }

  console.log = function(){
    var args = Array.prototype.slice.apply(arguments)
    var msg, i, arg

    log.apply(console, args)

    msg = []
    for (i=0; i<args.length; i++){
      arg = args[i]
      msg.push(JSON.stringify(arg, null, 4)) 
    }
    msg = msg.join(' ')

    append_to_DOM(msg)
  }
})()
