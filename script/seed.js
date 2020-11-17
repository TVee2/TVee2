'use strict'

const db = require('../server/db')
const {User, Segment, Channel, Program} = require('../server/db/models')

async function seed() {
  await db.sync({force: true})
  console.log('db synced!')

  const users = await Promise.all([
    User.create({email: 'cody@email.com', password: '123'}),
    User.create({email: 'murphy@email.com', password: '123'})
  ])

  const channel = await Channel.create({name:"SciFi"})
  const channel2 = await Channel.create({name:"Horror"})
  const channel3 = await Channel.create({name:"Classics"})

    //this is useful
    //await Segment.create({tkey:`d3/h${Math.floor(i/3600)}/m${Math.floor((i%3600)/60)}/s${i%60}`, channelId:channel.id})

  // seed next hour
  var now = Math.floor(new Date().valueOf()/1000)

  const programs = await Promise.all([
    Program.create({src: '/videos/test1.mp4', duration: 35, ad:false}),
    Program.create({src: '/videos/test2.mp4', duration: 30, ad:false}),
    // Program.create({src: './videos/test3.mp4', duration: 5, ad:false}),
  ])

  // for(let i=0;i<60*60;i++){
  //   var new_time = now + i    
  //   await Segment.create({tkey:new_time, progress:0, channelId:channel.id})
  // }
  // var segments = await Segment.findAll({order: [['tkey', 'ASC']]})
  // var i = 0
  // var j = 0
  // var progress
  // for(var k = 0; k<segments.length;k++){
  //   let segment = segments[k]
  //   await segment.setProgram(programs[i])
  //   segment.progress=j
  //   await segment.save()
  //   if(j===parseInt(programs[i].duration)){
  //     j=0
  //     if(i==programs.length-1){
  //       i=0
  //     }else{
  //       i++
  //     }
  //   }else{
  //     j++
  //   }
  // }

  console.log(`seeded ${users.length} users`)
  console.log(`seeded successfully`)
}

// We've separated the `seed` function from the `runSeed` function.
// This way we can isolate the error handling and exit trapping.
// The `seed` function is concerned only with modifying the database.
async function runSeed() {
  console.log('seeding...')
  try {
    await seed()
  } catch (err) {
    console.error(err)
    process.exitCode = 1
  } finally {
    console.log('closing db connection')
    await db.close()
    console.log('db connection closed')
  }
}

// Execute the `seed` function, IF we ran this module directly (`node seed`).
// `Async` functions always return a promise, so we can use `catch` to handle
// any errors that might occur inside of `seed`.
if (module === require.main) {
  runSeed()
}

// we export the seed function for testing purposes (see `./seed.spec.js`)
module.exports = seed
