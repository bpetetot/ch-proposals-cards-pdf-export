const fs = require('fs')
const { template, slice, pick, isNil } = require('lodash')
const puppeteer = require('puppeteer')

const cardTemplate = require('./card.template.js')
const cardsTemplate = require('./cards.template.js')

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

const printPDF = async () => {
  console.log('Generate cards...')
  const cardTemplateCompiled = template(cardTemplate)
  const cards = getCards(data).map(card => cardTemplateCompiled({ card }))

  const PAGE_SIZE = 8
  const pages = []
  for (let i = 0; i < cards.length; i = i + PAGE_SIZE) {
    const page = slice(cards, i, i + PAGE_SIZE).join('\n')
    pages.push(page)
  }

  const cardsTemplateCompiled = template(cardsTemplate)

  const html = cardsTemplateCompiled({ pages })

  console.log('Launch puppeteer...')
  const browser = await puppeteer.launch({ headless: true });

  console.log('Open cards page...')
  const page = await browser.newPage();
  await page.setContent(html);

  console.log('Generate PDF cards...')
  const pdf = await page.pdf({ path: 'export.pdf',format: 'A4' });
  console.log('PDF cards generated ✨')

  await browser.close();
  return pdf
}

printPDF()

// res.setHeader({ 'Content-Type': 'application/pdf', 'Content-Length': pdf.length })
// res.send(pdf);

// savePDF = () => {
//   this.openModal(‘Loading…’) // open modal
//  return getPDF() // API call
//    .then((response) => {
//      const blob = new Blob([response.data], {type: 'application/pdf'})
//      const link = document.createElement('a')
//      link.href = window.URL.createObjectURL(blob)
//      link.download = `your-file-name.pdf`
//      link.click()
//      this.closeModal() // close modal
//    })
//  .catch(err => /** error handling **/)
// }

// <button onClick={this.savePDF}>Save as PDF</button>