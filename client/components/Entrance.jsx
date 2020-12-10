import React, {Component} from 'react'

export default class Entrance extends Component {
  constructor() {
    super()

    this.state = {}
    this.frames = [
      `
           *     ,MMM8&&&.            *
                MMMM88&&&&&    .
               MMMM88&&&&&&&
   *           MMM88&&&&&&&&
               MMM88&&&&&&&&
               'MMM88&&&&&&'
                 'MMM8&&&'      *
        ||___/|
        )     (             .              '
       =|     /=
         )===(       *
        /     |
        |     |
       /       |
       |       /
_/|_/|_/|__  _/_/|_/|_/|_/|_/|_/|_/|_/|_/|_
|  |  |  |( (  |  |  |  |  |  |  |  |  |  |
|  |  |  | ) ) |  |  |  |  |  |  |  |  |  |
|  |  |  |(_(  |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  |  |  |
      `,`
           *     ,MMM8&&&.            *
                MMMM88&&&&&    .
               MMMM88&&&&&&&
   *           MMM88&&&&&&&&
               MMM88&&&&&&&&
               'MMM88&&&&&&'
                 'MMM8&&&'      *
        ||___/|
       =) ^Y^ (=            .              '
        |  ^  /
         )=*=(       *
        /     |
        |     |
       /| | | ||
       || | |_|/|
_/|_/|_//_// ___/|_/|_/|_/|_/|_/|_/|_/|_/|_
|  |  |  | |_) |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  |  |  |
      `,`
           *     ,MMM8&&&.            *
                MMMM88&&&&&    .
               MMMM88&&&&&&&
   *           MMM88&&&&&&&&
               MMM88&&&&&&&&
               'MMM88&&&&&&'
                 'MMM8&&&'      *    _
        ||___/|                      |
       =) ^Y^ (=   ||_/|              ||    '
        |  ^  /    )a a '._.-''''-.  //
         )=*=(    =|T_= /    ~  ~  |//
        /     |     '''|   ~   / ~  /
        |     |         |~   | |  ~/
       /| | | ||         |  ~/- | ~|
       || | |_|/|        || |  // /'
_/|_/|_//_// __//|_/|_/|_((_||((_//|_/|_/|_
|  |  |  | |_) |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  |  |  |
      `,`
           *     ,MMM8&&&.            *
                MMMM88&&&&&    .
               MMMM88&&&&&&&
   *           MMM88&&&&&&&&
               MMM88&&&&&&&&
               'MMM88&&&&&&'
                 'MMM8&&&'      *    _
        ||___/|                      |
        )     (    ||_/|              ||    '
       =|     /=   )- - '._.-''''-.  //
         )===(    =|T_= /    ~  ~  |//
        /     |     '''|   ~   / ~  /
        |     |         |~   | |  ~/
       /       |         |  ~/- | ~|
       |       /         || |  // /'
_/|_/|_/|_   _/_/|_/|_/|_((_||((_//|_/|_/|_
|  |  |  |( (  |  |  |  |  |  |  |  |  |  |
|  |  |  | ) ) |  |  |  |  |  |  |  |  |  |
|  |  |  |(_(  |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  |  |  |
      `,`
           *     ,MMM8&&&.            *
                MMMM88&&&&&    .
               MMMM88&&&&&&&
   *           MMM88&&&&&&&&
               MMM88&&&&&&&&
               'MMM88&&&&&&'
                 'MMM8&&&'      *    _
        ||___/|                      |
        )     (    ||_/|              ||    '
       =|     /=   )a a '._.-''''-.  //
         )===(    =|T_= /    ~  ~  |//
        /     |     '''|   ~   / ~  /
        |     |         |~   | |  ~/
       /       |         |  ~/- | ~|
       |       /         || |  // /'
_/|_/|_/|_   _/_/|_/|_/|_((_||((_//|_/|_/|_
|  |  |  |( (  |  |  |  |  |  |  |  |  |  |
|  |  |  | ) ) |  |  |  |  |  |  |  |  |  |
|  |  |  |(_(  |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  |  |  |
      `,`
           *     ,MMM8&&&.            *
                MMMM88&&&&&    .
               MMMM88&&&&&&&
   *           MMM88&&&&&&&&
               MMM88&&&&&&&&
               'MMM88&&&&&&'
                 'MMM8&&&'      *    
        ||___/|     /|___/|
        )     (     )    ~( .              '
       =|     /=   =|~    /=
         )===(       ) ~ (
        /     |     /     |
        |     |     ) ~   (
       /       |   /     ~ |
       |       /   |~     ~/
_/|_/|_/|__  _/_/|_/|__~__/_/|_/|_/|_/|_/|_
|  |  |  |( (  |  |  | ))  |  |  |  |  |  |
|  |  |  | ) ) |  |  |//|  |  |  |  |  |  |
|  |  |  |(_(  |  |  (( |  |  |  |  |  |  |
|  |  |  |  |  |  |  ||)|  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  |  |  |
      `
    ]
  }

  sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  componentDidMount() {
    let i = 0
    let interval = 400
    var pre = document.getElementById("pre")
    var post = document.getElementById("post")
    post.innerHTML = "Initializing..."; this.forceUpdate();
    while(i<this.frames.length){
      var func = (x) => {pre.innerHTML = this.frames[x]; this.forceUpdate(); }
      setTimeout(func.bind(this, i), i*interval)
      i++
    }

    setTimeout(() => {post.innerHTML = "Click anywhere to continue."; this.forceUpdate();}, this.frames.length*interval)
  }

  render() {
    return (
      <div style={{width: '100%', position:"absolute", height:"500px", top:"170px", padding:"15px", gridColumn:"1", gridRow:"1", zIndex:"10", backgroundColor:"white"}}>
        <pre id="pre"></pre>
        <pre id="post"></pre>
      </div>
    )
  }
}
