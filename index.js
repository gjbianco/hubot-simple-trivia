const trivia = require('./src/hubot-simple-trivia')

module.exports = robot => {

  // TODO
  // robot.hear(/^!triviatopics$/i, res => {
  //   res.send
  // })

  robot.hear(/^!trivianew ?(.*)$/i, res => {
    trivia
        .newQuestion()
        .then(s => res.send(s))
        .catch((e => {
          console.error(e)
          res.send('Having trouble... Sorry...')
        }))
  })

  robot.hear(/^!triviarepeat$/i, res => {
    trivia
        .repeatQuestion()
        .then(s => res.send(s))
        .catch((e => {
          console.error(e)
          res.send('Having trouble... Sorry...')
        }))
  })

  robot.hear(/^!ans ([abcdABCD])$/i, res => {
    trivia
        .answer(res.match[1])
        .then(s => res.send(s))
        .catch((e => {
          console.error(e)
          res.send('Having trouble... Sorry...')
        }))
  })

}
