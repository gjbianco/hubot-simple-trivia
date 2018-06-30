const _ = require('lodash')
const axios = require('axios')
const leven = require('leven')

const INACTIVE_MESSAGE = 'no active question! use `!trivianew` to start a new game'

module.exports = robot => {

  let currentQuestion
  let currentTopic

  function formatQuestion(question) {
    const randomAnswers = question.type === 'multiple' ? '\n' + randomizeAnswers(question) : ''
    return `*${question.category} - ${question.difficulty} - ${question.type}*\n${question.question}${randomAnswers}`
  }

  function randomizeAnswers(question) {
    const allAnswers = [
      question.correct_answer,
      question.incorrect_answers[0],
      question.incorrect_answers[1],
      question.incorrect_answers[2],
    ]
    return _.chain(allAnswers)
            .shuffle()
            .join('\n')
            .value()
  }

  // TODO
  // robot.hear(/^!triviatopics$/i, res => {
  //   res.send
  // })

  robot.hear(/^!trivianew ?(.*)$/i, res => {
    axios({
      method: 'get',
      url: 'https://opentdb.com/api.php?amount=1'
    })
      .then(result => (result.data))
      .then(data => (data.results[0]))
      .then((question) => {
        currentQuestion = question
        res.send(formatQuestion(question))
      })
      .catch(() => {
        res.send('could not get question')
      })
  })

  robot.hear(/^!triviarepeat$/i, res => {
    if (currentQuestion) {
      res.send(formatQuestion(currentQuestion))
    } else {
      res.send(INACTIVE_MESSAGE)
    }
  })

  robot.hear(/^!ans (.*)$/i, res => {
    if (!currentQuestion) {
      res.send(INACTIVE_MESSAGE)
      return
    }
    const ans = _.lowerCase(res.match[1])
    const correctAnswer = _.lowerCase(currentQuestion.correct_answer)
    const levenValue = leven(ans, correctAnswer)
    const correctLength = correctAnswer.length
    const levenPercent = Math.abs(100 * ((correctLength - levenValue) / correctLength))
    // console.log(levenPercent + '%')
    if (levenPercent > 85) {
      res.send('CORRECT')
      currentQuestion = undefined
    }
  })

}
