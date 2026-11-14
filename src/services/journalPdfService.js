'use client'

function getDateFromValue(value) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function getJournalDateInputValue(value) {
  const date = getDateFromValue(value)
  if (!date) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getJournalDateBounds(entries) {
  const dates = entries
    .map((entry) => getJournalDateInputValue(entry.createdAt))
    .filter(Boolean)
    .sort()

  return {
    fromDate: dates[0] || '',
    toDate: dates[dates.length - 1] || '',
  }
}

export function filterJournalEntriesByDateRange(entries, fromDate, toDate) {
  return entries
    .filter((entry) => {
      const entryDate = getJournalDateInputValue(entry.createdAt)
      if (!entryDate) return false
      return (!fromDate || entryDate >= fromDate) && (!toDate || entryDate <= toDate)
    })
    .sort((first, second) => String(first.createdAt || '').localeCompare(String(second.createdAt || '')))
}

function formatDateRange(dateValue) {
  const date = getDateFromValue(`${dateValue}T12:00:00`)
  return date
    ? date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
    : dateValue
}

function addPageHeader(doc, margin, pageWidth) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(51, 92, 72)
  doc.text('Diario personal', margin, 16)
  doc.setDrawColor(228, 238, 230)
  doc.line(margin, 20, pageWidth - margin, 20)
}

export async function downloadJournalEntriesPdf(entries, fromDate, toDate) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 18
  const textWidth = pageWidth - margin * 2 - 4
  let y = 24

  doc.setProperties({
    title: 'Diario personal',
    subject: `Registros del ${fromDate} al ${toDate}`,
  })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(23, 37, 31)
  doc.text('Diario personal', margin, y)
  y += 9

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(95, 108, 101)
  doc.text(`Del ${formatDateRange(fromDate)} al ${formatDateRange(toDate)}`, margin, y)
  doc.text(`${entries.length} ${entries.length === 1 ? 'entrada' : 'entradas'}`, margin, y + 6)
  y += 19

  for (const entry of entries) {
    const lines = doc.splitTextToSize(entry.text || '', textWidth)
    const entryHeaderHeight = 11

    if (y + entryHeaderHeight + 6 > pageHeight - margin) {
      doc.addPage()
      addPageHeader(doc, margin, pageWidth)
      y = 29
    }

    doc.setFillColor(228, 238, 230)
    doc.roundedRect(margin, y - 5, pageWidth - margin * 2, entryHeaderHeight, 2, 2, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(51, 92, 72)
    doc.text(`${entry.date || 'Sin fecha'}${entry.time ? `, ${entry.time}` : ''}`, margin + 4, y + 2)
    y += entryHeaderHeight + 2

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(45, 55, 50)
    for (const line of lines.length ? lines : ['']) {
      if (y > pageHeight - margin) {
        doc.addPage()
        addPageHeader(doc, margin, pageWidth)
        y = 29
      }
      doc.text(line, margin + 2, y)
      y += 5
    }

    y += 7
    doc.setDrawColor(225, 230, 226)
    doc.line(margin, y - 3, pageWidth - margin, y - 3)
  }

  const filename = `diario-${fromDate}-a-${toDate}.pdf`
  doc.save(filename)
}
