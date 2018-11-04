const _ = require('lodash')
const axios = require('axios')
const he = require('he')

module.exports = {
  newQuestion,
  repeatQuestion,
  answer
}

const INACTIVE_MESSAGE = 'No active question! use `!trivianew` to start a new game'

// Supports up to 6 multiple choice answers
const answerNames = ['A', 'B', 'C', 'D', 'E', 'F'];

let currentQuestion

function newQuestion() {
  return axios({
    method: 'get',
    url: 'https://opentdb.com/api.php?amount=1'
  })
    .then(result => (result.data))
    .then(data => (data.results[0]))
    .then(buildQuestion)
    .then(question => {
      currentQuestion = question
      return formatQuestion(question)
    })
}

function repeatQuestion() {
  return Promise.resolve().then(() => {
    if (currentQuestion) {
      return formatQuestion(currentQuestion)
    } else {
      return INACTIVE_MESSAGE
    }
  });
}

function answer(ans) {
  return Promise.resolve().then(() => {
    if (!currentQuestion) {
      return INACTIVE_MESSAGE
    }

    const idx = answerNames.indexOf(_.upperCase(ans))

    if (idx !== currentQuestion.correctAnswerIdx) {
      return 'WRONG!'
    }

    const correctAnswer = currentQuestion.correctAnswer
    currentQuestion = undefined
    return `CORRECT! The answer was \`${correctAnswer}\``
  })
}

function formatQuestion(question) {
  return `
* ${question.category} - ${question.difficulty} *
${question.question}
${formatAnswers(question.answers)}
`
}

function formatAnswers(answers) {
  const answersWithNames = answers.map((a, idx) => `${answerNames[idx]}) ${a}`)
  return answersWithNames.join('\n')
}

function insertIntoArray(arr, item, idx) {
  // Could use splice but I hate splice
  return _.flatten([
    arr.slice(0, idx),
    item,
    arr.slice(idx)
  ])
}

function buildQuestion(serverQuestion) {
  const correctAnswer = he.decode(serverQuestion.correct_answer)
  const incorrectAnswers = _.shuffle(_.map(serverQuestion.incorrect_answers, he.decode))
  const correctAnswerIdx = _.random(0, incorrectAnswers.length)
  const answers = insertIntoArray(
    incorrectAnswers,
    correctAnswer,
    correctAnswerIdx
  )

  return {
    question: he.decode(serverQuestion.question),
    category: he.decode(serverQuestion.category),
    difficulty: _.capitalize(he.decode(serverQuestion.difficulty)),
    answers: answers,
    correctAnswer: correctAnswer,
    correctAnswerIdx: correctAnswerIdx
  }
}