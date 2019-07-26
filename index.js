const fs = require('fs')
const { template, slice, pick, isNil } = require('lodash')

const file = fs.readFileSync('./export.json')
const data = JSON.parse(file)

const displayRating = (rating) => {
  if (isNil(rating) || rating < 0) return '-'
  if (rating.toString().indexOf('.') !== -1) {
    return rating.toFixed(1)
  }
  return rating
}

const getCards = ({ speakers, formats, categories, talks }) => {
  return talks.map(talk => {
    const format = formats.find(({ id }) => talk.formats === id)
    const category = categories.find(({ id }) => talk.categories === id)
    const speakersTalk = speakers.filter(s => talk.speakers.includes(s.uid))

    return {
      ...pick(talk, ['title','level','language','loves','hates']),
      rating: displayRating(talk.rating),
      speakers: talk.speakers,
      formats: format && format.name,
      categories: category && category.name,
      speakers: speakersTalk.map(s => s.displayName).join(' & ')
    }
  })
}

const cardTemplateFile = fs.readFileSync('./card.template')
const cardTemplate = template(cardTemplateFile)

const cards = getCards(data).map(card => cardTemplate({ card }))

const PAGE_SIZE = 8
const pages = []
for (let i = 0; i < cards.length; i = i + PAGE_SIZE) {
  const page = slice(cards, i, i + PAGE_SIZE).join('\n')
  pages.push(page)
}

const exportTemplateFile = fs.readFileSync('./export.template')
const exportTemplate = template(exportTemplateFile)

const exportHtml = exportTemplate({ pages })


fs.writeFileSync("export.html", exportHtml)

console.log(exportHtml)