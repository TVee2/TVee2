const Sequelize = require('sequelize')
const db = require('../db')

module.exports = db.define('segment', {
  tkey: {
    primaryKey: true,
    type: Sequelize.INTEGER,
    allowNull: false
  },
  playmargin:{
    type: Sequelize.BOOLEAN
  },
  progress:{
    type: Sequelize.INTEGER,
  },
})


//when posting a timeslot, check all other starttimes to see if within startime + duraction interval
//create a schedule for fast lookup?

//when to place commercials in schedule?


//do i want this to be a youtube wrapper?
//open project individuals can adapt?
//website builder like shopify?
//massive platform?

//key requiremnets:

/*
  want to be able to play with one click
  switch from channel to channel with one button
  video playlist should be curated
    incentivize curators and make easy for uploader
  want to cast and have switch from vid to vid easily
  live chat on side




  so really, internet tv u dont need a mouse for
  models:
  channels
  1 schedule per channel
  schedule has many programs  --  a calendar basically
  schedule has many 30 minute slots -- used to check for conflicts, play adds to remainder
      dont think itll be hard to check for conflicts within same schedule
  programs have a time slot


create hash table of times that vary every single second
do a broadcast every second, sync if no match on time

create string primary key


  seed with 30 minute increments
  

  to start, 24 hour broadcast of schedule


*/
