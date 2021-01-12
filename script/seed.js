'use strict'

const db = require('../server/db')
const {User, Segment, Channel, Program} = require('../server/db/models')

async function seed() {
  await db.sync({force: true})
  console.log('db synced!')

  const users = await Promise.all([
    User.create({email: 'will@pix.com', username:"will", password: '1234'}),
  ])

  // const channel = await Channel.create({name:"SciFi", userId:1})
  // const channel2 = await Channel.create({name:"Horror", userId:1})
  // const channel3 = await Channel.create({name:"Classics", userId:1})

  const program1 = await Program.create({title: 'city', duration: 35, ad:false})
  const program2 = await Program.create({title: 'wave', duration: 30, ad:false})

  var counter = 0
  var vidswitch = true
  var now = Math.floor(new Date().valueOf()/1000)
  // for(let i=0;i<2*60*60;i++){
  //   var new_time = now + i
  //   var program = vidswitch?program1:program2
  //   await Segment.create({tkey:channel.id+""+new_time, progress:counter, programId:program.id, channelId:channel.id})
  //   counter ++
  //   if(program.duration < counter){
  //     vidswitch = !vidswitch
  //     counter = 0
  //     i = i + 4
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
